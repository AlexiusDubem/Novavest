'use client'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring' as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
}

export function HeroSection() {
  return (
    <main className="overflow-hidden">
        <section>
          <div className="relative mx-auto max-w-6xl px-6 pt-32 lg:pb-16 lg:pt-48">
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
              >
                <h1 className="text-balance text-4xl font-medium sm:text-5xl md:text-6xl">
                  Illuminate Your Financial Future
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-cyan-400 glow-text">
                  Premium fintech platform for secure investments, crypto-backed loans, and advanced portfolio management. Build wealth with confidence.
                </p>

                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3">
                    Get Started – Free
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5 px-8 py-3">
                    Learn More
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    Secured by cold storage
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    Regulated partners
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    2M+ users
                  </div>
                </div>

                <div className="lg:hidden mt-16">
                  <div className="mx-auto max-w-sm overflow-hidden rounded-[2rem] border border-border bg-background/95 shadow-2xl shadow-slate-950/10">
                    <div className="bg-gradient-to-r from-primary to-cyan-500 px-4 py-3">
                      <div className="flex items-center justify-between text-white">
                        <span className="text-[11px] uppercase tracking-[0.35em]">NovaInvest</span>
                        <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold">
                          Active Plan
                        </span>
                      </div>
                    </div>
                    <div className="px-4 pb-4 pt-3">
                      <div className="rounded-[1.5rem] bg-slate-950/95 p-4 shadow-inner">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Portfolio Value</p>
                            <p className="text-2xl font-semibold text-white">$45.2K</p>
                          </div>
                          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">
                            +12.8%
                          </span>
                        </div>
                        <div className="relative h-28 overflow-hidden rounded-[1.5rem] bg-slate-900">
                          <div className="absolute inset-x-3 top-8 h-1.5 rounded-full bg-emerald-400/70 blur-xl" />
                          <div className="absolute inset-x-6 top-14 h-1.5 rounded-full bg-cyan-400/70 blur-xl" />
                          <div className="absolute bottom-6 left-3 right-3 h-1.5 rounded-full bg-white/10" />
                          <div className="absolute left-5 bottom-12 h-8 w-1.5 rounded-full bg-white/60" />
                          <div className="absolute left-16 bottom-14 h-12 w-1.5 rounded-full bg-white/60" />
                          <div className="absolute left-24 bottom-10 h-10 w-1.5 rounded-full bg-white/60" />
                          <div className="absolute left-32 bottom-5 h-20 w-1.5 rounded-full bg-white/60" />
                          <div className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-white/5" />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                          <div className="rounded-2xl bg-white/5 p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Yield</p>
                            <p className="mt-1 text-sm font-semibold text-white">8.4%</p>
                          </div>
                          <div className="rounded-2xl bg-white/5 p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Risk</p>
                            <p className="mt-1 text-sm font-semibold text-white">Moderate</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  aria-hidden={true}
                  className="hidden lg:block bg-radial from-primary/50 dark:from-primary/25 relative mx-auto mt-32 max-w-2xl to-transparent to-55% text-left"
                >
                  <div className="bg-background border-border/50 absolute inset-0 mx-auto w-80 -translate-x-3 -translate-y-12 rounded-[2rem] border p-2 [mask-image:linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:-translate-x-6">
                    <div className="relative h-96 overflow-hidden rounded-[1.5rem] border p-2 pb-12 before:absolute before:inset-0 before:bg-[repeating-linear-gradient(-45deg,var(--border),var(--border)_1px,transparent_1px,transparent_6px)] before:opacity-50"></div>
                  </div>
                  <div className="bg-muted dark:bg-background/50 border-border/50 mx-auto w-80 translate-x-4 rounded-[2rem] border p-2 backdrop-blur-3xl [mask-image:linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:translate-x-8">
                    <div className="bg-background space-y-2 overflow-hidden rounded-[1.5rem] border p-2 shadow-xl dark:bg-white/5 dark:shadow-black dark:backdrop-blur-3xl">
                      <AppComponent />

                      <div className="bg-muted rounded-[1rem] p-4 pb-16 dark:bg-white/5"></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] mix-blend-overlay [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:opacity-5" />
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>
        <LogoCloud />
      </main>
  )
}

const AppComponent = () => {
  return (
    <div className="relative space-y-3 rounded-[1rem] bg-white/5 p-4">
      <div className="flex items-center gap-1.5 text-orange-400">
        <svg
          className="size-5"
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 32 32"
        >
          <path
            fill="#f7931a"
            d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736L8.286 15.67c6.43-1.602 10.336-8.113 8.736-14.542l.616 13.776zm1.35-4.945c.965.27 1.785-1.165.814-1.565l-4.563-1.32a.556.556 0 0 1-.434-.605l.835-4.41c.203-1.07-1.43-.883-1.568.234l-.842 4.41a.556.556 0 0 1-.434.605l-5.508 1.32c-1.07.203-.883 1.43.234 1.568l5.508 1.32a.556.556 0 0 1 .434.605l-.835 4.41c-.203 1.07 1.43.883 1.568-.234l.842-4.41a.556.556 0 0 1 .434-.605l4.563-1.32c1.07-.203.883-1.43-.234-1.568l.179-.036z"
          />
        </svg>
        <div className="text-sm font-medium">Portfolio</div>
      </div>
      <div className="space-y-3">
        <div className="text-foreground border-b border-white/10 pb-3 text-sm font-medium">
          Your investments have grown 45% this year compared to last year.
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="space-x-1">
              <span className="text-foreground align-baseline text-xl font-medium">$45,230</span>
              <span className="text-muted-foreground text-xs">Portfolio Value</span>
            </div>
            <div className="flex h-5 items-center rounded bg-gradient-to-l from-emerald-400 to-indigo-600 px-2 text-xs text-white">
              2024
            </div>
          </div>
          <div className="space-y-1">
            <div className="space-x-1">
              <span className="text-foreground align-baseline text-xl font-medium">$31,120</span>
              <span className="text-muted-foreground text-xs">Portfolio Value</span>
            </div>
            <div className="text-foreground bg-muted flex h-5 w-2/3 items-center rounded px-2 text-xs dark:bg-white/20">
              2023
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


const Logo = ({ className }: { className?: string }) => {
  return (
    <svg viewBox="0 0 78 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('h-5 w-auto', className)}>
      <path d="M3 0H5V18H3V0ZM13 0H15V18H13V0ZM18 3V5H0V3H18ZM0 15V13H18V15H0Z" fill="url(#logo-gradient)" />
      <path
        d="M27.06 7.054V12.239C27.06 12.5903 27.1393 12.8453 27.298 13.004C27.468 13.1513 27.7513 13.225 28.148 13.225H29.338V14.84H27.808C26.9353 14.84 26.2667 14.636 25.802 14.228C25.3373 13.82 25.105 13.157 25.105 12.239V7.054H24V5.473H25.105V3.144H27.06V5.473H29.338V7.054H27.06ZM30.4782 10.114C30.4782 9.17333 30.6709 8.34033 31.0562 7.615C31.4529 6.88967 31.9855 6.32867 32.6542 5.932C33.3342 5.524 34.0822 5.32 34.8982 5.32C35.6349 5.32 36.2752 5.46733 36.8192 5.762C37.3745 6.04533 37.8165 6.40233 38.1452 6.833V5.473H40.1002V14.84H38.1452V13.446C37.8165 13.888 37.3689 14.2563 36.8022 14.551C36.2355 14.8457 35.5895 14.993 34.8642 14.993C34.0595 14.993 33.3229 14.789 32.6542 14.381C31.9855 13.9617 31.4529 13.3837 31.0562 12.647C30.6709 11.899 30.4782 11.0547 30.4782 10.114ZM38.1452 10.148C38.1452 9.502 38.0092 8.941 37.7372 8.465C37.4765 7.989 37.1309 7.62633 36.7002 7.377C36.2695 7.12767 35.8049 7.003 35.3062 7.003C34.8075 7.003 34.3429 7.12767 33.9122 7.377C33.4815 7.615 33.1302 7.972 32.8582 8.448C32.5975 8.91267 32.4672 9.468 32.4672 10.114C32.4672 10.76 32.5975 11.3267 32.8582 11.814C33.1302 12.3013 33.4815 12.6753 33.9122 12.936C34.3542 13.1853 34.8189 13.31 35.3062 13.31C35.8049 13.31 36.2695 13.1853 36.7002 12.936C37.1309 12.6867 37.4765 12.324 37.7372 11.848C38.0092 11.3607 38.1452 10.794 38.1452 10.148ZM43.6317 4.232C43.2803 4.232 42.9857 4.113 42.7477 3.875C42.5097 3.637 42.3907 3.34233 42.3907 2.991C42.3907 2.63967 42.5097 2.345 42.7477 2.107C42.9857 1.869 43.2803 1.75 43.6317 1.75C43.9717 1.75 44.2607 1.869 44.4987 2.107C44.7367 2.345 44.8557 2.63967 44.8557 2.991C44.8557 3.34233 44.7367 3.637 44.4987 3.875C44.2607 4.113 43.9717 4.232 43.6317 4.232ZM44.5837 5.473V14.84H42.6457V5.473H44.5837ZM49.0661 2.26V14.84H47.1281V2.26H49.0661ZM50.9645 10.114C50.9645 9.17333 51.1572 8.34033 51.5425 7.615C51.9392 6.88967 52.4719 6.32867 53.1405 5.932C53.8205 5.524 54.5685 5.32 55.3845 5.32C56.1212 5.32 56.7615 5.46733 57.3055 5.762C57.8609 6.04533 58.3029 6.40233 58.6315 6.833V5.473H60.5865V14.84H58.6315V13.446C58.3029 13.888 57.8552 14.2563 57.2885 14.551C56.7219 14.8457 56.0759 14.993 55.3505 14.993C54.5459 14.993 53.8092 14.789 53.1405 14.381C52.4719 13.9617 51.9392 13.3837 51.5425 12.647C51.1572 11.899 50.9645 11.0547 50.9645 10.114ZM58.6315 10.148C58.6315 9.502 58.4955 8.941 58.2235 8.465C57.9629 7.989 57.6172 7.62633 57.1865 7.377C56.7559 7.12767 56.2912 7.003 55.7925 7.003C55.2939 7.003 54.8292 7.12767 54.3985 7.377C53.9679 7.615 53.6165 7.972 53.3445 8.448C53.0839 8.91267 52.9535 9.468 52.9535 10.114C52.9535 10.76 53.0839 11.3267 53.3445 11.814C53.6165 12.3013 53.9679 12.6753 54.3985 12.936C54.8405 13.1853 55.3052 13.31 55.7925 13.31C56.2912 13.31 56.7559 13.1853 57.1865 12.936C57.6172 12.6867 57.9629 12.324 58.2235 11.848C58.4955 11.3607 58.6315 10.794 58.6315 10.148ZM65.07 6.833C65.3533 6.357 65.7273 5.98867 66.192 5.728C66.668 5.456 67.229 5.32 67.875 5.32V7.326H67.382C66.6227 7.326 66.0447 7.51867 65.648 7.904C65.2627 8.28933 65.07 8.958 65.07 9.91V14.84H63.132V5.473H65.07V6.833ZM73.3624 10.165L77.6804 14.84H75.0624L71.5944 10.811V14.84H69.6564V2.26H71.5944V9.57L74.9944 5.473H77.6804L73.3624 10.165Z"
        fill="currentColor"
      />
      <defs>
        <linearGradient id="logo-gradient" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9B99FE" />
          <stop offset="1" stopColor="#2BC8B7" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const LogoCloud = () => {
  return (
    <section className="bg-background pb-16 md:pb-32">
      <div className="group relative m-auto max-w-6xl px-6">
        <div className="flex flex-col items-center md:flex-row">
          <div className="inline md:max-w-44 md:border-r md:pr-6">
            <p className="text-end text-sm">Powering the best teams</p>
          </div>
          <div className="relative py-6 md:w-[calc(100%-11rem)]">
            <InfiniteSlider
              durationOnHover={20}
              duration={40}
              gap={112}
            >
              <div className="flex">
                <img
                  className="mx-auto h-5 w-fit dark:invert"
                  src="https://html.tailus.io/blocks/customers/nvidia.svg"
                  alt="Nvidia Logo"
                  height="20"
                  width="auto"
                />
              </div>

              <div className="flex">
                <img
                  className="mx-auto h-4 w-fit dark:invert"
                  src="https://html.tailus.io/blocks/customers/column.svg"
                  alt="Column Logo"
                  height="16"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-4 w-fit dark:invert"
                  src="https://html.tailus.io/blocks/customers/github.svg"
                  alt="GitHub Logo"
                  height="16"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-5 w-fit dark:invert"
                  src="https://html.tailus.io/blocks/customers/nike.svg"
                  alt="Nike Logo"
                  height="20"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-5 w-fit dark:invert"
                  src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                  alt="Lemon Squeezy Logo"
                  height="20"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-4 w-fit dark:invert"
                  src="https://html.tailus.io/blocks/customers/laravel.svg"
                  alt="Laravel Logo"
                  height="16"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-7 w-fit dark:invert"
                  src="https://html.tailus.io/blocks/customers/lilly.svg"
                  alt="Lilly Logo"
                  height="28"
                  width="auto"
                />
              </div>

              <div className="flex">
                <img
                  className="mx-auto h-6 w-fit dark:invert"
                  src="https://html.tailus.io/blocks/customers/openai.svg"
                  alt="OpenAI Logo"
                  height="24"
                  width="auto"
                />
              </div>
            </InfiniteSlider>

            <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
            <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
            <ProgressiveBlur className="pointer-events-none absolute left-0 top-0 h-full w-20" direction="left" blurIntensity={1} />
            <ProgressiveBlur className="pointer-events-none absolute right-0 top-0 h-full w-20" direction="right" blurIntensity={1} />
          </div>
        </div>
      </div>
    </section>
  )
}
