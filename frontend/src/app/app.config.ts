import { ApplicationConfig } from "@angular/core"; // Removido importProvidersFrom pois não é mais necessário aqui
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { getAuth, provideAuth } from "@angular/fire/auth";

import { routes } from "./app.routes";
import { authInterceptor } from "./core/interceptors/auth.interceptor"; // Note a letra minúscula (função)

import { environment } from "../environments/environment";

const firebaseConfig = environment.firebaseConfig;

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // Correção 1: Usando o interceptor funcional
    provideHttpClient(withInterceptors([authInterceptor])),

    // Correção 2: Providers do Firebase movidos para o array principal
    // (Eles não devem ficar dentro de importProvidersFrom)
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ],
};
