import UIKit
import Capacitor

/// Web uygulamasının alt menüsünü iOS'un gerçek Liquid Glass malzemesiyle çizen native sekme çubuğu.
///
/// - iOS 26+: `UIGlassEffect` (Apple'ın Liquid Glass'ı) — arkasından kayan içeriği gerçekten
///   kırar/büker, dokununca parlar ve esner (`isInteractive`).
/// - iOS 25 ve altı: sistem "chrome" bulanıklığı (yedek görünüm).
///
/// JS tarafı (`src/native/tabBar.js`) tek bir `render` çağrısıyla tüm durumu gönderir:
/// `{ items: [{id, label, icon}], selected, badges: {id: sayı}, theme: "light"|"dark", visible }`.
/// Kullanıcı bir sekmeye dokununca `select` olayı `{ id }` ile JS'e iletilir.
@objc(NativeTabBarPlugin)
public class NativeTabBarPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeTabBarPlugin"
    public let jsName = "NativeTabBar"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "render", returnType: CAPPluginReturnPromise)
    ]

    private var bar: GlassTabBarView?

    @objc func render(_ call: CAPPluginCall) {
        let rawItems = call.options["items"] as? [[String: Any]]
        let items = rawItems?.compactMap { dict -> GlassTabBarView.Item? in
            guard let id = dict["id"] as? String else { return nil }
            return .init(id: id, label: dict["label"] as? String ?? id, icon: dict["icon"] as? String ?? "circle")
        }
        let selected = call.getString("selected")
        let theme = call.getString("theme")
        let visible = call.getBool("visible") ?? true
        var badges: [String: Int] = [:]
        if let raw = call.options["badges"] as? [String: Any] {
            for (key, value) in raw {
                if let n = value as? Int, n > 0 { badges[key] = n }
                else if let n = value as? Double, n > 0 { badges[key] = Int(n) }
            }
        }

        DispatchQueue.main.async { [weak self] in
            guard let self, let host = self.bridge?.viewController?.view else {
                call.reject("Görünüm hazır değil")
                return
            }
            let bar = self.bar ?? self.install(in: host)
            if let items { bar.setItems(items) }
            if let selected { bar.setSelected(selected, animated: true) }
            bar.setBadges(badges)
            switch theme {
            case "dark": bar.overrideUserInterfaceStyle = .dark
            case "light": bar.overrideUserInterfaceStyle = .light
            default: bar.overrideUserInterfaceStyle = .unspecified
            }
            bar.setVisible(visible, animated: true)
            call.resolve()
        }
    }

    private func install(in host: UIView) -> GlassTabBarView {
        let bar = GlassTabBarView()
        bar.onSelect = { [weak self] id in
            self?.notifyListeners("select", data: ["id": id])
        }
        bar.translatesAutoresizingMaskIntoConstraints = false
        host.addSubview(bar)

        // Web'deki .bottom-nav ile aynı ölçüler: kenarlardan 16pt, en fazla 440pt, 64pt yükseklik,
        // alttan max(12, güvenli alan − 8).
        let preferredWidth = bar.widthAnchor.constraint(equalToConstant: 440)
        preferredWidth.priority = .defaultHigh
        let followSafeArea = bar.bottomAnchor.constraint(equalTo: host.safeAreaLayoutGuide.bottomAnchor, constant: 8)
        followSafeArea.priority = .defaultHigh
        NSLayoutConstraint.activate([
            bar.centerXAnchor.constraint(equalTo: host.centerXAnchor),
            bar.leadingAnchor.constraint(greaterThanOrEqualTo: host.safeAreaLayoutGuide.leadingAnchor, constant: 16),
            bar.trailingAnchor.constraint(lessThanOrEqualTo: host.safeAreaLayoutGuide.trailingAnchor, constant: -16),
            preferredWidth,
            bar.heightAnchor.constraint(equalToConstant: GlassTabBarView.height),
            followSafeArea,
            bar.bottomAnchor.constraint(lessThanOrEqualTo: host.bottomAnchor, constant: -12)
        ])
        self.bar = bar
        return bar
    }
}

// MARK: - Görünüm

final class GlassTabBarView: UIView {
    struct Item: Equatable {
        let id: String
        let label: String
        let icon: String
    }

    static let height: CGFloat = 64
    private static let pad: CGFloat = 6

    /// Web'deki --primary-text ile aynı renk (açık #1d4ed8 / koyu #93c5fd)
    private static let accent = UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor(red: 0x93 / 255, green: 0xc5 / 255, blue: 0xfd / 255, alpha: 1)
            : UIColor(red: 0x1d / 255, green: 0x4e / 255, blue: 0xd8 / 255, alpha: 1)
    }
    private static let lensFill = UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor(white: 1, alpha: 0.14)
            : UIColor(white: 0, alpha: 0.07)
    }

    var onSelect: ((String) -> Void)?

    private let material: UIVisualEffectView
    private let lens = UIView()
    private let stack = UIStackView()
    private var items: [Item] = []
    private var buttons: [TabButton] = []
    private var selectedID: String?
    private var isShown = true
    private let haptics = UISelectionFeedbackGenerator()

    override init(frame: CGRect) {
        if #available(iOS 26.0, *) {
            let glass = UIGlassEffect(style: .regular)
            glass.isInteractive = true
            material = UIVisualEffectView(effect: glass)
        } else {
            material = UIVisualEffectView(effect: UIBlurEffect(style: .systemChromeMaterial))
        }
        super.init(frame: frame)

        material.translatesAutoresizingMaskIntoConstraints = false
        material.layer.cornerRadius = Self.height / 2
        material.layer.cornerCurve = .continuous
        material.clipsToBounds = true
        if #unavailable(iOS 26.0) {
            material.layer.borderWidth = 0.5
            material.layer.borderColor = UIColor.separator.cgColor
            layer.shadowColor = UIColor.black.cgColor
            layer.shadowOpacity = 0.12
            layer.shadowRadius = 16
            layer.shadowOffset = CGSize(width: 0, height: 6)
        }
        addSubview(material)

        lens.backgroundColor = Self.lensFill
        lens.layer.cornerCurve = .continuous
        lens.isUserInteractionEnabled = false
        material.contentView.addSubview(lens)

        stack.axis = .horizontal
        stack.distribution = .fillEqually
        stack.translatesAutoresizingMaskIntoConstraints = false
        material.contentView.addSubview(stack)

        NSLayoutConstraint.activate([
            material.topAnchor.constraint(equalTo: topAnchor),
            material.bottomAnchor.constraint(equalTo: bottomAnchor),
            material.leadingAnchor.constraint(equalTo: leadingAnchor),
            material.trailingAnchor.constraint(equalTo: trailingAnchor),
            stack.topAnchor.constraint(equalTo: material.contentView.topAnchor, constant: Self.pad),
            stack.bottomAnchor.constraint(equalTo: material.contentView.bottomAnchor, constant: -Self.pad),
            stack.leadingAnchor.constraint(equalTo: material.contentView.leadingAnchor, constant: Self.pad),
            stack.trailingAnchor.constraint(equalTo: material.contentView.trailingAnchor, constant: -Self.pad)
        ])
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) kullanılmıyor") }

    // Kapsülün dışındaki dokunuşlar web görünümüne geçsin
    override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
        isShown && super.point(inside: point, with: event)
    }

    func setItems(_ newItems: [Item]) {
        guard newItems != items else { return }
        items = newItems
        buttons.forEach { $0.removeFromSuperview() }
        buttons = newItems.map { item in
            let button = TabButton(item: item, accent: Self.accent)
            button.addAction(UIAction { [weak self] _ in self?.tap(item.id) }, for: .touchUpInside)
            stack.addArrangedSubview(button)
            return button
        }
        if let selectedID { setSelected(selectedID, animated: false) }
    }

    func setSelected(_ id: String, animated: Bool) {
        let changed = id != selectedID
        selectedID = id
        for button in buttons { button.isActive = button.item.id == id }
        guard changed || !animated else { return }
        setNeedsLayout()
        if animated && window != nil {
            UIView.animate(withDuration: 0.45, delay: 0, usingSpringWithDamping: 0.78, initialSpringVelocity: 0.4,
                           options: [.allowUserInteraction, .beginFromCurrentState]) {
                self.layoutIfNeeded()
            }
        }
    }

    func setBadges(_ badges: [String: Int]) {
        for button in buttons { button.badge = badges[button.item.id] }
    }

    func setVisible(_ visible: Bool, animated: Bool) {
        guard visible != isShown else { return }
        isShown = visible
        let changes = {
            self.alpha = visible ? 1 : 0
            self.transform = visible ? .identity : CGAffineTransform(translationX: 0, y: 24).scaledBy(x: 0.94, y: 0.94)
        }
        if animated {
            UIView.animate(withDuration: 0.35, delay: 0, usingSpringWithDamping: 0.85, initialSpringVelocity: 0,
                           options: [.beginFromCurrentState], animations: changes)
        } else {
            changes()
        }
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        guard let index = items.firstIndex(where: { $0.id == selectedID }), !items.isEmpty else {
            lens.alpha = 0
            return
        }
        material.contentView.layoutIfNeeded()
        let segment = stack.bounds.width / CGFloat(items.count)
        lens.alpha = 1
        lens.frame = CGRect(x: stack.frame.minX + segment * CGFloat(index), y: stack.frame.minY,
                            width: segment, height: stack.bounds.height)
        lens.layer.cornerRadius = lens.bounds.height / 2
    }

    private func tap(_ id: String) {
        if id != selectedID { haptics.selectionChanged() }
        setSelected(id, animated: true)
        onSelect?(id)
    }
}

// MARK: - Sekme düğmesi

private final class TabButton: UIControl {
    let item: GlassTabBarView.Item
    private let accent: UIColor
    private let iconView = UIImageView()
    private let titleLabel = UILabel()
    private let badgeLabel = BadgeLabel()

    var isActive = false { didSet { applyColors() } }
    var badge: Int? {
        didSet {
            badgeLabel.text = badge.map { $0 > 9 ? "9+" : String($0) }
            badgeLabel.isHidden = badge == nil
            accessibilityValue = badge.map { "\($0) acil" }
        }
    }

    init(item: GlassTabBarView.Item, accent: UIColor) {
        self.item = item
        self.accent = accent
        super.init(frame: .zero)

        let config = UIImage.SymbolConfiguration(pointSize: 19, weight: .semibold)
        iconView.image = (UIImage(systemName: item.icon) ?? UIImage(systemName: "circle"))?.withConfiguration(config)
        iconView.contentMode = .center
        iconView.translatesAutoresizingMaskIntoConstraints = false

        titleLabel.text = item.label
        titleLabel.font = .systemFont(ofSize: 11, weight: .semibold)
        titleLabel.adjustsFontSizeToFitWidth = true
        titleLabel.minimumScaleFactor = 0.8
        titleLabel.textAlignment = .center
        titleLabel.translatesAutoresizingMaskIntoConstraints = false

        badgeLabel.isHidden = true
        badgeLabel.translatesAutoresizingMaskIntoConstraints = false

        addSubview(iconView)
        addSubview(titleLabel)
        addSubview(badgeLabel)
        NSLayoutConstraint.activate([
            iconView.centerXAnchor.constraint(equalTo: centerXAnchor),
            iconView.topAnchor.constraint(equalTo: topAnchor, constant: 6),
            iconView.heightAnchor.constraint(equalToConstant: 26),
            titleLabel.topAnchor.constraint(equalTo: iconView.bottomAnchor, constant: 1),
            titleLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 2),
            titleLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -2),
            badgeLabel.centerXAnchor.constraint(equalTo: iconView.centerXAnchor, constant: 13),
            badgeLabel.centerYAnchor.constraint(equalTo: iconView.centerYAnchor, constant: -9)
        ])

        isAccessibilityElement = true
        accessibilityLabel = item.label
        accessibilityTraits = .button
        applyColors()
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) kullanılmıyor") }

    override var isHighlighted: Bool {
        didSet {
            UIView.animate(withDuration: 0.25, delay: 0, usingSpringWithDamping: 0.6, initialSpringVelocity: 0,
                           options: [.allowUserInteraction, .beginFromCurrentState]) {
                self.transform = self.isHighlighted ? CGAffineTransform(scaleX: 0.9, y: 0.9) : .identity
            }
        }
    }

    private func applyColors() {
        let color: UIColor = isActive ? accent : .secondaryLabel
        iconView.tintColor = color
        titleLabel.textColor = color
        accessibilityTraits = isActive ? [.button, .selected] : .button
    }
}

private final class BadgeLabel: UILabel {
    override init(frame: CGRect) {
        super.init(frame: frame)
        font = .systemFont(ofSize: 10, weight: .bold)
        textColor = .white
        textAlignment = .center
        backgroundColor = .systemRed
        layer.cornerRadius = 8
        layer.masksToBounds = true
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) kullanılmıyor") }

    override var intrinsicContentSize: CGSize {
        let size = super.intrinsicContentSize
        return CGSize(width: max(16, size.width + 8), height: 16)
    }
}
