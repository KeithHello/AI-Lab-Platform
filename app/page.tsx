import Link from 'next/link';
import { Button } from '@/components/ui/button';

import { prisma } from '@/lib/prisma';
import ProjectCard from '@/components/project/ProjectCard';
import { ProjectCardData } from '@/types';
import { Briefcase, Shield, Star, Terminal, Cpu, Coins, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default async function HomePage() {
  let hotProjects: ProjectCardData[] = [];
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'OPEN', isApproved: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        projectSkills: { include: { skillTag: { select: { id: true, name: true } } } },
        client: { select: { name: true } },
        _count: { select: { applications: true } },
      },
    });

    hotProjects = projects.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      skills: p.projectSkills.map((ps) => ps.skillTag),
      budget: Number(p.budget),
      currency: p.currency,
      deadline: p.deadline,
      status: p.status,
      applicationCount: p._count.applications,
      clientName: p.client.name,
      createdAt: p.createdAt,
    }));
  } catch {
    // Database might not be available yet
  }

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 via-transparent to-background pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-fade-in-up">
                <Sparkles className="h-3.5 w-3.5" />
                <span>最安全透明的 AI 與科技研發接案平台</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-foreground font-mono animate-fade-in-up animation-delay-100">
                連接全球 AI 頂尖人才 <br />
                <span className="gradient-text">讓科技專案精準落地</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed animate-fade-in-up animation-delay-200">
                安全、透明、高效的合作體驗。無論是 AI 模型訓練、前後端研發，還是跨境專案，都能在這裡找到最適合的專業人才，並享有資金雙盲評價的安全保障。
              </p>
              <div className="flex flex-wrap gap-4 pt-2 animate-fade-in-up animation-delay-300">
                <Link href="/projects">
                  <Button size="lg" className="h-12 px-6 font-semibold shadow-sm hover:shadow transition-all hover:bg-primary/95 cursor-pointer">
                    瀏覽案件 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="outline" size="lg" className="h-12 px-6 font-semibold bg-background hover:bg-muted transition-all cursor-pointer">
                    立即註冊
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Premium Mock Dashboard Graphic */}
            <div className="lg:col-span-5 relative animate-fade-in-up animation-delay-200">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 blur-2xl rounded-full" />
              <div className="relative border bg-card/75 backdrop-blur shadow-xl rounded-2xl p-6 border-border/80 space-y-6 animate-float">
                {/* Mock Header */}
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">workspace_agent_v1.sh</span>
                </div>

                {/* Mock Freelancer Profile Card */}
                <div className="p-4 rounded-xl border bg-background/50 space-y-3 shadow-sm hover:border-primary/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-primary text-sm font-mono">
                        JD
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">Alex Chen</h4>
                        <p className="text-xs text-muted-foreground">Senior AI Research Engineer</p>
                      </div>
                    </div>
                    <div className="flex items-center text-yellow-500 text-xs gap-1 font-bold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>5.0</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-primary border border-indigo-100">PyTorch</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-primary border border-indigo-100">LLM Fine-tuning</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-primary border border-indigo-100">LangChain</span>
                  </div>
                </div>

                {/* Mock Project Progress Card */}
                <div className="p-4 rounded-xl border bg-background/50 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold font-mono">Agentic Search System</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">
                      進行中
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>進度: 75%</span>
                      <span>預算: $12,500 USD</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>

                {/* Interactive Status Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span>資金安全託管</span>
                  </div>
                  <span>100% 雙盲公正評價</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">平台特色</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">安全、透明、高效，專為高科技與軟體研發打造的接案體驗</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="premium-card p-6 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary">
              <Coins className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold font-mono">多幣別支援</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              支援 TWD、USD、JPY、HKD、CNY 等五種常用貨幣，讓跨境科技合作無障礙，發案接案輕鬆結算。
            </p>
          </div>

          <div className="premium-card p-6 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold font-mono">安全交易與託管</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              健全的帳戶權限審核、案件驗收流程與舉報申訴機制，保障發案方資金安全與接案方勞動成果。
            </p>
          </div>

          <div className="premium-card p-6 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold font-mono">雙盲評價機制</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              雙方各自完成對專案的評分與文字回饋後，才同步公開評價結果，確保信譽評鑑的公正與客觀。
            </p>
          </div>

          <div className="premium-card p-6 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold font-mono">AI 輔助審核</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              採用先進的 AI 模型輔助審核案件的內容詳情、背景要求與驗收指標，提升專案品質，縮短對接時程。
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-card border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">使用流程</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">簡單四步，開啟您的專案合作</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="space-y-3 text-center md:text-left relative">
              <div className="text-5xl font-extrabold text-primary/20 font-mono">01</div>
              <h4 className="text-lg font-bold">發布案件或註冊</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                雇主提供詳細背景、交付物與驗收標準；人才填寫技能標籤並加入平台。
              </p>
            </div>
            <div className="space-y-3 text-center md:text-left">
              <div className="text-5xl font-extrabold text-primary/20 font-mono">02</div>
              <h4 className="text-lg font-bold">精準應徵與面試</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                人才在線提出申請與報價，雙方通過平台即時溝通確認合作細節。
              </p>
            </div>
            <div className="space-y-3 text-center md:text-left">
              <div className="text-5xl font-extrabold text-primary/20 font-mono">03</div>
              <h4 className="text-lg font-bold">線上交付與驗收</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                接案者提交研發成果，雇主依照預先設定的標準進行審查與確認。
              </p>
            </div>
            <div className="space-y-3 text-center md:text-left">
              <div className="text-5xl font-extrabold text-primary/20 font-mono">04</div>
              <h4 className="text-lg font-bold">互評完成與結案</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                專案圓滿結束後，雙方進行雙盲信譽評價，累積個人或企業的誠信資產。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Projects Preview */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">精選熱門案件</h2>
              <p className="text-muted-foreground">最新發布、極具挑戰性且預算優渥的專案機會</p>
            </div>
            <Link href="/projects">
              <Button variant="outline" className="bg-background hover:bg-muted font-medium cursor-pointer shadow-sm">
                查看全部案件
              </Button>
            </Link>
          </div>
          {hotProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/80 max-w-xl mx-auto">
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">尚無開放案件，立即發布您的第一個案件！</p>
              <Link href="/projects/new">
                <Button className="mt-4 cursor-pointer font-semibold shadow-sm">發布案件</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
