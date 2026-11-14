import UIKit
import Capacitor

/// iOS'un kendi sekme çubuğu (UITabBarController).
/// iOS 26+ ile derlenince sistem bunu kendiliğinden Liquid Glass olarak çizer ve aşağı
/// kaydırınca küçültür — Genç Gönüllüler uygulamasındaki NativeTabs ile aynı bileşen.
///
/// Tek bir web görünümü (MainViewController) vardır; seçilen sekmenin kabına taşınır
/// ve sekme değişimi web tarafına `select` olayıyla bildirilir (React yönlendirmesi çalışır).
final class UniTabBarController: UITabBarController, UITabBarControllerDelegate {
    struct Tab {
        let id: String
        let label: String
        let icon: String
        let selectedIcon: String
    }

    /// Web'deki NAV_ITEMS ile aynı sıra ve kimlikler
    static let tabs: [Tab] = [
        Tab(id: "schedule", label: "Program", icon: "calendar", selectedIcon: "calendar"),
        Tab(id: "exams", label: "Sınavlar", icon: "pencil.and.list.clipboard", selectedIcon: "pencil.and.list.clipboard"),
        Tab(id: "homework", label: "Ödevler", icon: "checklist", selectedIcon: "checklist"),
        Tab(id: "stats", label: "Özet", icon: "chart.bar", selectedIcon: "chart.bar.fill")
    ]

    /// Web'deki --primary-text ile aynı renk (açık #1d4ed8 / koyu #93c5fd)
    static let accent = UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor(red: 0x93 / 255, green: 0xc5 / 255, blue: 0xfd / 255, alpha: 1)
            : UIColor(red: 0x1d / 255, green: 0x4e / 255, blue: 0xd8 / 255, alpha: 1)
    }

    let bridgeController = MainViewController()
    var onSelect: ((String) -> Void)?
    private var containers: [UIViewController] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        delegate = self
        view.backgroundColor = MainViewController.appBackground
        tabBar.tintColor = Self.accent

        containers = Self.tabs.map { tab in
            let container = TabContainerController()
            container.view.backgroundColor = MainViewController.appBackground
            container.edgesForExtendedLayout = .all
            container.extendedLayoutIncludesOpaqueBars = true
            container.tabBarItem = UITabBarItem(
                title: tab.label,
                image: UIImage(systemName: tab.icon),
                selectedImage: UIImage(systemName: tab.selectedIcon)
            )
            return container
        }
        setViewControllers(containers, animated: false)

        if #available(iOS 26.0, *) {
            tabBarMinimizeBehavior = .onScrollDown
        }

        attachBridge(to: containers[0])
        // Giriş ekranında çubuk görünmesin; web tarafı hazır olunca gösterir
        setBarHidden(true, animated: false)
    }

    // MARK: Web tarafından gelen durum

    func select(id: String) {
        guard let index = Self.tabs.firstIndex(where: { $0.id == id }), index != selectedIndex else { return }
        attachBridge(to: containers[index])
        selectedIndex = index
    }

    func setBadges(_ badges: [String: Int]) {
        for (index, tab) in Self.tabs.enumerated() {
            containers[index].tabBarItem.badgeValue = badges[tab.id].map { $0 > 9 ? "9+" : String($0) }
        }
    }

    func setTheme(_ theme: String?) {
        switch theme {
        case "dark": tabBar.overrideUserInterfaceStyle = .dark
        case "light": tabBar.overrideUserInterfaceStyle = .light
        default: tabBar.overrideUserInterfaceStyle = .unspecified
        }
    }

    func setBarHidden(_ hidden: Bool, animated: Bool) {
        if #available(iOS 18.0, *) {
            setTabBarHidden(hidden, animated: animated)
        } else {
            tabBar.isHidden = hidden
        }
    }

    // MARK: Sekme seçimi

    func tabBarController(_ tabBarController: UITabBarController, shouldSelect viewController: UIViewController) -> Bool {
        attachBridge(to: viewController)
        return true
    }

    func tabBarController(_ tabBarController: UITabBarController, didSelect viewController: UIViewController) {
        guard let index = containers.firstIndex(of: viewController) else { return }
        onSelect?(Self.tabs[index].id)
    }

    /// Tek web görünümünü seçilen sekmenin kabına taşır (sayfa yeniden yüklenmez)
    private func attachBridge(to container: UIViewController) {
        let bridge = bridgeController
        guard bridge.parent !== container else { return }
        if bridge.parent != nil {
            bridge.willMove(toParent: nil)
            bridge.view.removeFromSuperview()
            bridge.removeFromParent()
        }
        container.addChild(bridge)
        bridge.view.frame = container.view.bounds
        bridge.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        container.view.addSubview(bridge.view)
        bridge.didMove(toParent: container)
        // Sekme çubuğu bu kaydırma görünümünü izleyerek kayınca küçülür
        if let scrollView = bridge.webView?.scrollView {
            container.setContentScrollView(scrollView, for: .bottom)
        }
    }
}

/// Web tarafı köprüsü: `render({ selected, badges, theme, visible })`, dokunuşlar `select` olayıyla döner.
@objc(NativeTabBarPlugin)
public class NativeTabBarPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeTabBarPlugin"
    public let jsName = "NativeTabBar"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "render", returnType: CAPPluginReturnPromise)
    ]

    @objc func render(_ call: CAPPluginCall) {
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
            guard let self, let tabs = self.bridge?.viewController?.tabBarController as? UniTabBarController else {
                call.reject("Sekme çubuğu bulunamadı")
                return
            }
            if tabs.onSelect == nil {
                tabs.onSelect = { [weak self] id in self?.notifyListeners("select", data: ["id": id]) }
            }
            if let selected { tabs.select(id: selected) }
            tabs.setBadges(badges)
            tabs.setTheme(theme)
            tabs.setBarHidden(!visible, animated: true)
            call.resolve()
        }
    }
}

/// Sekme kabı: durum çubuğu stilini içindeki web görünümüne bırakır (StatusBar eklentisi çalışsın)
final class TabContainerController: UIViewController {
    override var childForStatusBarStyle: UIViewController? { children.first }
    override var childForStatusBarHidden: UIViewController? { children.first }
}
