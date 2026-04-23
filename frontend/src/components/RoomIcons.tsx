import type { SVGProps } from 'react'

function Svg(props: SVGProps<SVGSVGElement> & { title?: string }) {
  const { title, children, ...rest } = props
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} {...rest}>
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

export function IconBedSingle(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props} title="Quarto individual">
      <path d="M4 18V6M4 12h12v6M4 12V9a2 2 0 0 1 2-2h6M16 12h4v6M8 7h2" />
    </Svg>
  )
}

export function IconBedCasal(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props} title="Quarto casal">
      <path d="M3 18V8M3 13h8v5M3 13V10a1.5 1.5 0 0 1 1.5-1.5H9M11 13h10v5M11 13V10a1.5 1.5 0 0 1 1.5-1.5H17M6.5 8.5h1" />
    </Svg>
  )
}

export function IconAr(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props} title="Ar-condicionado">
      <path d="M12 3v18M5 8l14 8M5 16l14-8M5 12h14" />
    </Svg>
  )
}

export function IconHidro(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props} title="Hidromassagem">
      <path d="M8 18h8M6 14c2-3 4-3 6 0s4 3 6 0M7 10V8a3 3 0 0 1 6 0v2M10 6V5M14 6V5" />
    </Svg>
  )
}
