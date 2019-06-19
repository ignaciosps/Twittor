if (navigator.serviceWorker) {
    navigator.serviceWorker.register('./sw.js');
}


// Referencias de jQuery

var titulo = $('#titulo');
var nuevoBtn = $('#nuevo-btn');
var salirBtn = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn = $('#post-btn');
var avatarSel = $('#seleccion');
var timeline = $('#timeline');

var modal = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns = $('.seleccion-avatar');
var txtMensaje = $('#txtMensaje');

// El usuario, contiene el ID del héroe seleccionado
var usuario;




// ===== Codigo de la aplicación

function crearMensajeHTML(mensaje, personaje) {

    var content = `
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${ personaje }.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${ personaje }</h3>
                <br/>
                ${ mensaje }
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn(ingreso) {

    if (ingreso) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');

    }

}


// Seleccion de personaje
avatarBtns.on('click', function() {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function() {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function() {

    modal.removeClass('oculto');
    modal.animate({
        marginTop: '-=1000px',
        opacity: 1
    }, 200);

});

// Boton de cancelar mensaje
cancelarBtn.on('click', function() {
    modal.animate({
        marginTop: '+=1000px',
        opacity: 0
    }, 200, function() {
        modal.addClass('oculto');
        txtMensaje.val('');
    });
});

// Boton de enviar mensaje
postBtn.on('click', function() {

    var mensaje = txtMensaje.val();
    if (mensaje.length === 0) {
        cancelarBtn.click();
        return;
    }

    crearMensajeHTML(mensaje, usuario);

});













let deferredPrompt;
let btnAdd = document.getElementById('add');
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can add to home screen
  btnAdd.style.display = 'block';
});

window.addEventListener('appinstalled', (evt) => {
	console.log("Instalada");
    app.logEvent('a2hs', 'installed');
      btnAdd.style.display = 'none';
});


btnAdd.addEventListener('click', (e) => {
  // hide our user interface that shows our A2HS button
  btnAdd.style.display = 'none';
  // Show the prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice
    .then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
});




setTimeout(function() {

	if(  deferredPrompt){
		console.log("test1");
	}else{
  		btnAdd.style.display = 'none';
		console.log("test2");
	}
}, 1000);






