export function downloadBrandedQRCode(
  qrSvgElement: SVGSVGElement,
  firstName: string,
  lastName: string
) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const qrSize = 400
  const padding = 60
  const headerHeight = 140
  const footerHeight = 80
  const canvasWidth = qrSize + padding * 2
  const canvasHeight = headerHeight + qrSize + footerHeight + padding

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  const logoImg = new Image()
  logoImg.crossOrigin = 'anonymous'

  const renderQR = (withLogo: boolean, logoSize = 0, logoY = 0) => {
    if (withLogo) {
      const logoX = (canvasWidth - logoSize) / 2
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('DonorElevate', canvasWidth / 2, logoY + logoSize + 35)
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('DonorElevate', canvasWidth / 2, 60)
    }

    const svgClone = qrSvgElement.cloneNode(true) as SVGSVGElement
    svgClone.setAttribute('width', qrSize.toString())
    svgClone.setAttribute('height', qrSize.toString())

    const svgData = new XMLSerializer().serializeToString(svgClone)
    const qrImg = new Image()

    qrImg.onload = () => {
      const qrX = padding
      const qrY = headerHeight

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40)

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

      ctx.fillStyle = '#94a3b8'
      ctx.font = '18px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Scan to save contact', canvasWidth / 2, qrY + qrSize + 50)

      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${firstName || 'contact'}_${lastName || 'card'}_QR.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 'image/png')
    }

    qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  logoImg.onload = () => {
    const logoSize = 60
    const logoY = padding / 2
    renderQR(true, logoSize, logoY)
  }

  logoImg.onerror = () => {
    renderQR(false)
  }

  logoImg.src = '/logo-mark-white.png'
}
