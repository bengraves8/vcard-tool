export function downloadBrandedQRCode(
  qrSvgElement: SVGSVGElement,
  firstName: string,
  lastName: string
) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const qrSize = 300
  const padding = 40
  const headerHeight = 120
  const footerHeight = 60
  const canvasWidth = qrSize + padding * 2
  const canvasHeight = headerHeight + qrSize + footerHeight

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  const logoImg = new Image()
  logoImg.crossOrigin = 'anonymous'

  const renderQR = (withLogo: boolean, logoSize = 0, logoY = 0) => {
    // Draw header with logo and text
    if (withLogo) {
      const logoX = (canvasWidth - logoSize) / 2
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('DonorElevate', canvasWidth / 2, logoY + logoSize + 28)
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('DonorElevate', canvasWidth / 2, 50)
    }

    const svgClone = qrSvgElement.cloneNode(true) as SVGSVGElement
    svgClone.setAttribute('width', qrSize.toString())
    svgClone.setAttribute('height', qrSize.toString())

    const svgData = new XMLSerializer().serializeToString(svgClone)
    const qrImg = new Image()

    qrImg.onload = () => {
      const qrX = padding
      const qrY = headerHeight

      // White background for QR code with smaller padding
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24)

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

      ctx.fillStyle = '#94a3b8'
      ctx.font = '14px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Scan to save contact', canvasWidth / 2, qrY + qrSize + 35)

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
    const logoSize = 48
    const logoY = 20
    renderQR(true, logoSize, logoY)
  }

  logoImg.onerror = () => {
    renderQR(false)
  }

  logoImg.src = '/logo-mark-white.png'
}
