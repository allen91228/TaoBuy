// 登录页面使用空布局，避免被 admin layout 包裹
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}




