/**
 * 
 * Crear proyecto
 * Habilitar google drive
 * Consentimiento
 * Ir a credenciales
 * Crear una CLAVES DE API
 * Crear ID de cliente de OAuth
 */

// Client ID and API key from the Developer Console
var CLIENT_ID = '526404798597-t99io8br39vj50oe91uukhhb822rgrhs.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDr3c7ubyiLBY9isPlLMstNOqiEegxt0_c';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file';

var driveAuthorizeButton = document.getElementById('drive-authorize');
var driveSignoutButton = document.getElementById('drive-signout');
var driveUploadButton = document.getElementById('drive-save-button');

var driveIniciarSesionAlert = document.getElementById('drive-iniciar-sesion-alert');
var driveErrorAlert = document.getElementById('drive-error-alert');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        driveAuthorizeButton.onclick = handleAuthClick;
        driveSignoutButton.onclick = handleSignoutClick;
        // driveUploadButton.onclick = handleSubirAudioClick
    }, (error) => {
        // appendPre(JSON.stringify(error, null, 2));
        driveErrorAlert.style.display = 'block';
        driveErrorAlert.innerHTML = JSON.stringify(error, null, 2)
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        driveAuthorizeButton.style.display = 'none';
        driveSignoutButton.style.display = 'block';
        driveUploadButton.style.display = 'block';
        driveIniciarSesionAlert.style.display = 'none';
    } else {
        driveAuthorizeButton.style.display = 'block';
        driveSignoutButton.style.display = 'none';
        driveUploadButton.style.display = 'none';
        driveIniciarSesionAlert.style.display = 'block';


    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().disconnect();
}

// /**
//  * Append a pre element to the body containing the given message
//  * as its text node. Used to display the results of the API call.
//  *
//  * @param {string} message Text to be placed in pre element.
//  */
// const appendPre = (message) => {
//     var pre = document.getElementById('content');
//     var textContent = document.createTextNode(message + '\n');
//     pre.appendChild(textContent);
// }