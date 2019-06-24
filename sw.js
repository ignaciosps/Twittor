//Imports
importScripts('./js/sw-utils.js');

const CACHE_STATIC_NAME = 'static-v2';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';
const CACHE_INMUTABLE_NAME = 'inmutable-v1';
//Los avatars podrían ser dinamicos e ir en el otro caché, teniendo en este una imagen por defecto  
const APP_SHELL = [
    './',
    './index.html',
    './css/style.css',
    './img/favicon.ico',
    './img/avatars/hulk.jpg',
    './img/avatars/ironman.jpg',
    './img/avatars/spiderman.jpg',
    './img/avatars/thor.jpg',
    './img/avatars/wolverine.jpg',
    './js/app.js',
    './js/sw-utils.js'
];
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    './css/animate.css',
    './js/libs/jquery.js'
];

self.addEventListener('install', e => {

    const cacheStatic = caches.open(CACHE_STATIC_NAME)
        .then(cache => cache.addAll(APP_SHELL));

    const cacheInmutable = caches.open(CACHE_INMUTABLE_NAME)
        .then(cache => cache.addAll(APP_SHELL_INMUTABLE));

    const respuesta = Promise.all([cacheStatic, cacheInmutable]).catch(err => {
        console.log(err);
    });

    e.waitUntil(respuesta);
});

self.addEventListener('activate', e => {

    const respuesta = caches.keys()
        .then(keys => {
            keys.forEach(key => {
                if (key !== CACHE_STATIC_NAME && key.includes('static')) {
                    return caches.delete(key);
                }
            })
        })

    e.waitUntil(respuesta);
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
            url: 'https://mapanet.com.ar/virgendelhuerto/inicio.html',
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
