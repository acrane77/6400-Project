// Draws the QR matrix on a convas and downloads as a PNG

export function downloadQrPng(matrix: number[][], filename: string, moduleSize = 20, quietZone = 4) {
	const size = (matrix.length + quietZone * 2) * moduleSize
	const canvas = document.createElement('canvas')
	canvas.width = size
	canvas.height = size

	const ctx = canvas.getContext('2d')
	if (!ctx) return

	ctx.fillStyle = '#ffffff'
	ctx.fillRect(0, 0, size, size)
	ctx.fillStyle = '#000000'
	matrix.forEach((row, r) => {
		row.forEach((cell, c) => {
		if (cell) ctx.fillRect((c + quietZone) * moduleSize, (r + quietZone) * moduleSize, moduleSize, moduleSize)
		})
	})

	const link = document.createElement('a')
	link.href = canvas.toDataURL('image/png')
	link.download = filename
	link.click()
}
