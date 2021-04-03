import React from "react"
import './App.css';
import createTheme from "./theme";
import Chat from "./pages/Chat/Chat"

import { useSelector } from "react-redux";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import { StylesProvider } from "@material-ui/styles";
import { ThemeProvider } from "styled-components";

function App() {
  const theme = useSelector((state) => state.theme);
  const muiTheme = createTheme(theme.currentTheme);

  return (
    <React.Fragment>
      <StylesProvider injectFirst>
        <MuiThemeProvider theme={muiTheme}>
          <ThemeProvider theme={muiTheme}>
            <Chat/>
          </ThemeProvider>
        </MuiThemeProvider>
      </StylesProvider>
    </React.Fragment>
  );
}

export default App;
