/* ==========================================================================
   VORTEXAPPS SYSTEM CONFIGURATION MATRIX - EXAMPLE
   ========================================================================== */
window.VORTEXAPPS_CONFIG = {
    // SHA-256 hash of the administrative password (e.g. hash of "admin00")
    adminPasswordHash: "006657998771eb1ef75d0a26f8824af99da8bf4f7261d3a4d896708286a618eb",

    // OpenRouter / Gemini API Key credentials
    geminiApiKey: "",

    // Firebase pipeline synchronization credentials
    firebaseConfig: {
        apiKey: "your_firebase_api_key",
        authDomain: "your_firebase_auth_domain",
        databaseURL: "your_firebase_database_url",
        projectId: "your_firebase_project_id",
        storageBucket: "your_firebase_storage_bucket",
        messagingSenderId: "your_firebase_messaging_sender_id",
        appId: "your_firebase_app_id",
        measurementId: "your_firebase_measurement_id"
    }
};
