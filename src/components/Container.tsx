type Props = {
  children: React.ReactNode
}

const Container = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen flex-col max-w-4xl mx-auto md:px-5 px-3">
      {children}
    </div>
  )
}

export default Container
