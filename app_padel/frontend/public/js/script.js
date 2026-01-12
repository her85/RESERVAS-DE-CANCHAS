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

// Mensajes: creación, cierre y autodestrucción
function createMessage(text, type = 'info', options = {}) {
	const { autoDismiss = true, timeout = 5000 } = options;
	let container = document.getElementById('messages-container');
	if (!container) {
		container = document.createElement('div');
		container.id = 'messages-container';
		container.className = 'messages-container';
		document.body.appendChild(container);
	}

	const msg = document.createElement('div');
	msg.className = `message message-${type}`;
	msg.setAttribute('role', type === 'error' ? 'alert' : 'status');

	const span = document.createElement('span');
	span.className = 'message-body';
	span.textContent = text;

	const btn = document.createElement('button');
	btn.className = 'message-close';
	btn.setAttribute('aria-label', 'Cerrar mensaje');
	btn.innerHTML = '&times;';

	btn.addEventListener('click', () => removeMessage(msg));

	msg.appendChild(span);
	msg.appendChild(btn);
	container.appendChild(msg);

	// Aparece con transición (si hay estilos) y se autodestruye
	requestAnimationFrame(() => { msg.style.opacity = '1'; });
	if (autoDismiss) {
		setTimeout(() => removeMessage(msg), timeout);
	}
	return msg;
}

function removeMessage(msg) {
	if (!msg) return;
	// cancelar redirección programada si existe
	try {
		if (msg.__redirectTimer) {
			clearTimeout(msg.__redirectTimer);
			msg.__redirectTimer = null;
		}
		if (msg.__redirectInterval) {
			clearInterval(msg.__redirectInterval);
			msg.__redirectInterval = null;
		}
	} catch (e) {}
	msg.style.transition = 'opacity 200ms ease, transform 200ms ease';
	msg.style.opacity = '0';
	msg.style.transform = 'translateY(-6px)';
	setTimeout(() => { if (msg && msg.parentNode) msg.parentNode.removeChild(msg); }, 220);
}

// Inicializar cierres para mensajes generados por el servidor (renderizados en el HTML)
document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('messages-container');
	if (!container) return;
	container.querySelectorAll('.message-close').forEach(btn => {
		btn.addEventListener('click', (e) => {
			const msg = e.target.closest('.message');
			removeMessage(msg);
		});
	});
	// Si hay botones 'Volver' renderizados por el servidor, no hacemos nada extra;
	// el enlace ya navegará a /canchas. Podemos añadir un handler para confirmación si se desea.
	container.querySelectorAll('.message-back').forEach(btn => {
		btn.addEventListener('click', (e) => {
			// dejar que el enlace funcione; opcional: cerrar mensaje antes de navegar
			const msg = e.target.closest('.message');
			removeMessage(msg);
			// navegación por defecto del <a> seguirá
		});
	});

	// Si hay mensajes con data-back-to, programar redirección automática con cuenta regresiva
	container.querySelectorAll('.message[data-back-to]').forEach(msg => {
		const back = msg.getAttribute('data-back-to');
		if (!back) return;
		const seconds = 10;
		let remaining = seconds;
		const countdownEl = msg.querySelector('.countdown');
		if (countdownEl) countdownEl.textContent = String(remaining);
		try {
			msg.__redirectInterval = setInterval(() => {
				remaining -= 1;
				if (countdownEl) countdownEl.textContent = String(remaining);
				if (remaining <= 0) {
					clearInterval(msg.__redirectInterval);
					msg.__redirectInterval = null;
				}
			}, 1000);
			msg.__redirectTimer = setTimeout(() => {
				window.location.href = back;
			}, seconds * 1000);
		} catch (e) { }
	});
});
