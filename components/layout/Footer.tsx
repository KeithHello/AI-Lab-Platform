export default function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary font-mono">AI Lab Platform</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              連接發案方與接案者的專業平台。安全、透明、高效的合作體驗。
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-foreground mb-4 font-mono">快速連結</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/projects" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">案件列表</a></li>
              <li><a href="/sign-in" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">登入</a></li>
              <li><a href="/sign-up" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">註冊</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-foreground mb-4 font-mono">平台資訊</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                支援多幣別交易
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                雙盲評價機制
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                舉報與糾紛處理
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} AI Lab Platform. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">服務條款</a>
            <a href="#" className="hover:text-primary transition-colors">隱私權政策</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
