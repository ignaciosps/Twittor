importScripts('https://ignaciosps.github.io/Twittor/js/sw-utils.js');


const STATIC_CACHE    = 'static-v3';
const DYNAMIC_CACHE   = 'dynamic-v3';
const INMUTABLE_CACHE = 'inmutable-v3';


const APP_SHELL = [
    'https://ignaciosps.github.io/Twittor/',
    'https://ignaciosps.github.io/Twittor/index.html',
    'https://ignaciosps.github.io/Twittor/css/style.css',
    'https://ignaciosps.github.io/Twittor/img/favicon.ico',
    'https://ignaciosps.github.io/Twittor/img/avatars/hulk.jpg',
    'https://ignaciosps.github.io/Twittor/img/avatars/ironman.jpg',
    'https://ignaciosps.github.io/Twittor/img/avatars/spiderman.jpg',
    'https://ignaciosps.github.io/Twittor/img/avatars/thor.jpg',
    'https://ignaciosps.github.io/Twittor/img/avatars/wolverine.jpg',
    'https://ignaciosps.github.io/Twittor/js/app.js',
    'https://ignaciosps.github.io/Twittor/js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    'https://cdn.jsdelivr.net/npm/pouchdb@7.0.0/dist/pouchdb.min.js'
];



self.addEventListener('install', e => {


    const cacheStatic = caches.open( STATIC_CACHE ).then(cache => 
        cache.addAll( APP_SHELL ));

    const cacheInmutable = caches.open( INMUTABLE_CACHE ).then(cache => 
        cache.addAll( APP_SHELL_INMUTABLE ));



    e.waitUntil( Promise.all([ cacheStatic, cacheInmutable ])  );

});


self.addEventListener('activate', e => {

    const respuesta = caches.keys().then( keys => {

        keys.forEach( key => {

            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }

            if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
                return caches.delete(key);
            }

        });

    });

    e.waitUntil( respuesta );

});





self.addEventListener( 'fetch', e => {

    let respuesta;

    if ( e.request.url.includes('/api') ) {

        // return respuesta????
        respuesta = manejoApiMensajes( DYNAMIC_CACHE, e.request );

    } else {

        respuesta = caches.match( e.request ).then( res => {

            if ( res ) {
                
                actualizaCacheStatico( STATIC_CACHE, e.request, APP_SHELL_INMUTABLE );
                return res;
                
            } else {
    
                return fetch( e.request ).then( newRes => {
    
                    return actualizaCacheDinamico( DYNAMIC_CACHE, e.request, newRes );
    
                });
    
            }
    
        });

    }

    e.respondWith( respuesta );

});


// tareas asíncronas
self.addEventListener('sync', e => {

    console.log('SW: Sync');

    if ( e.tag === 'nuevo-post' ) {

        // postear a BD cuando hay conexión
        const respuesta = postearMensajes();
        
        e.waitUntil( respuesta );
    }

});

// Escuchar PUSH
self.addEventListener('push', e => {

    // console.log(e);

    const data = JSON.parse( e.data.text() );

    // console.log(data);


    const title = 'Novena a la Virgen del Huerto';
    const options = {
        body: data.mensaje,
        // icon: 'img/icons/icon-72x72.png',
        icon: `https://mapanet.com.ar/virgendelhuerto/img/icons/icon-72x72.png`,
        badge: 'img/favicon.ico',
        //image: 'https://vignette.wikia.nocookie.net/marvelcinematicuniverse/images/5/5b/Torre_de_los_Avengers.png/revision/latest?cb=20150626220613&path-prefix=es',
        vibrate: [125,75,125,275,200,275,125,75,125,275,200,600,200,600],
        openUrl: 'https://mapanet.com.ar/virgendelhuerto/inicio.html',
        data: {
            url: 'https://mapanet.com.ar/virgendelhuerto/inicio.html'
        }
    };


    e.waitUntil( self.registration.showNotification( title, options) );


});


// Cierra la notificacion
self.addEventListener('notificationclose', e => {
    console.log('Notificación cerrada', e);
});


self.addEventListener('notificationclick', e => {


    const notificacion = e.notification;
    const accion = e.action;


    console.log({ notificacion, accion });
    // console.log(notificacion);
    // console.log(accion);
    

    const respuesta = clients.matchAll()
    .then( clientes => {

        let cliente = clientes.find( c => {
            return c.visibilityState === 'visible';
        });

        if ( cliente !== undefined ) {
            cliente.navigate( notificacion.data.url );
            cliente.focus();
        } else {
            clients.openWindow( notificacion.data.url );
        }

        return notificacion.close();

    });

    e.waitUntil( respuesta );


});
