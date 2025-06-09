import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { appWithTranslation } from "next-i18next";
import "@/styles/globals.css";
import { AuthPage } from "@/features/auth/components/AuthPage";
import { AppPropsWithAuth } from "@/features/auth/types";
import { QueryProvider } from "@/components/query/QueryProvider";
import "dayjs/locale/ja";
import { ThemeProvider } from "@mui/material";
import { materialTheme } from "@/utils/materialTheme";
import { AlertProvider } from "@/features/alert/components/AlertProvider";
import { I18nextProvider } from "react-i18next";
import i18n from "@/features/translation/i18n";
import { ClientOnly } from "@/components/layout/ClientOnly";
import { DayjsLocalizationProvider } from "@/features/localization/components/DayjsLocalizationProvider";
import "@/styles/print-form.css";

const App = ({
  Component,
  pageProps,
}: AppPropsWithAuth): React.ReactElement => {
  const isNeedAuth = Component.isNeedAuth !== false; // default: need auth

  return (
    <ClientOnly>
      <QueryProvider>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={materialTheme}>
            <DayjsLocalizationProvider>
              <AlertProvider>
                <AuthProvider>
                  {isNeedAuth ? (
                    <AuthPage>
                      <Component {...pageProps} />
                    </AuthPage>
                  ) : (
                    <Component {...pageProps} />
                  )}
                </AuthProvider>
              </AlertProvider>
            </DayjsLocalizationProvider>
          </ThemeProvider>
        </I18nextProvider>
      </QueryProvider>
    </ClientOnly>
  );
};

export default appWithTranslation(App);
