import type { Preview } from "@storybook/react";
import React, { useEffect } from "react";
import { materialTheme } from "@/utils/materialTheme";
import i18n from "../src/features/translation/i18n";
import { ThemeProvider } from "@mui/material";
import { I18nextProvider } from "react-i18next";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/ja";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;

/**
 * decorators: コンポーネントのデフォルトラッパー
 */
const withI18n = (storyFn, context): React.ReactElement => {
  const { locale } = context.globals;

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{storyFn()}</I18nextProvider>;
};

const baseDecorator = (storyFn): React.ReactElement => {
  return <ThemeProvider theme={materialTheme}>{storyFn()}</ThemeProvider>;
};

const withLocalizationProvider = (storyFn): React.ReactElement => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
      {storyFn()}
    </LocalizationProvider>
  );
};

export const decorators = [baseDecorator, withI18n, withLocalizationProvider];

/**
 * globalTypes: ツールバーカスタマイズ
 */
export const globalTypes = {
  locale: {
    toolbar: {
      icon: "globe",
      items: [
        { value: "ja", title: "日本語" },
        { value: "en", title: "English" },
      ],
      showName: true,
    },
  },
};
