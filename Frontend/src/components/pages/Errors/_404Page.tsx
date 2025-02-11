const _404Page = () => {
  return (
    <div className="min-h-screen h-full w-full grid place-content-center border place-items-center gap-3 p-12">
      <p className="font-semibold uppercase text-secondary-foreground">
        Oops! Page not found
      </p>
      <h3 className="font-bold text-6xl">404</h3>
      <p className="text-center uppercase">
        We are sorry, but the page you requested was not found
      </p>
    </div>
  )
}

export default _404Page