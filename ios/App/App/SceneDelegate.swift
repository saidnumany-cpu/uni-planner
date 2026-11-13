import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = MainViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

/// Uygulamanın web görünümünü taşıyan ana ekran.
/// - Arka plan rengi sistem temasını izler (açık #f6f7fb / koyu #0b0f17), böylece
///   üst kenarda ve sayfa esnediğinde açık renk görünmez.
/// - iOS 26'nın kaydırma kenarı efekti (üstteki bulanık/beyaz sis) kapatılır;
///   üst çubuğun cam görünümünü web tarafı kendisi çiziyor.
class MainViewController: CAPBridgeViewController {
    private static let appBackground = UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor(red: 11 / 255, green: 15 / 255, blue: 23 / 255, alpha: 1)
            : UIColor(red: 246 / 255, green: 247 / 255, blue: 251 / 255, alpha: 1)
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        view.backgroundColor = Self.appBackground
        guard let webView = webView else { return }
        webView.isOpaque = false
        webView.backgroundColor = Self.appBackground
        webView.scrollView.backgroundColor = Self.appBackground
        if #available(iOS 26.0, *) {
            webView.scrollView.topEdgeEffect.isHidden = true
            webView.scrollView.bottomEdgeEffect.isHidden = true
        }
    }
}
