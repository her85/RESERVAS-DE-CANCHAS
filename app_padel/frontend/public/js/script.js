// Oculta el overlay del spinner cuando la página termine de cargar.
function hideSpinner() {
	const overlay = document.getElementById('spinner-overlay');
	if (!overlay) return;
	overlay.style.transition = 'opacity 300ms ease';
	overlay.style.opacity = '0';
	document.body.classList.remove('no-scroll');
	setTimeout(() => {
		if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
	}, 350);
}

// Si el evento load ya sucedió, llamarlo; en caso contrario, esperar al load.
if (document.readyState === 'complete') {
	hideSpinner();
} else {
	window.addEventListener('load', hideSpinner);
}

// Fallback: si algo falla, quitar el spinner después de 10s para evitar bloqueo.
setTimeout(hideSpinner, 10000);
