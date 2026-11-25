import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import NotificationCenter from "./components/NotificationCenter";
import VisitorAssistant from "./components/VisitorAssistant";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import AIWriting from "./pages/AIWriting";
import ImageStudio from "./pages/ImageStudio";
import CameraStudio from "./pages/CameraStudio";
import Projects from "./pages/Projects";
import Threadline from "./pages/Threadline";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/dashboard/camera"} component={CameraStudio} />
      <Route path={"/dashboard/images"} component={ImageStudio} />
      <Route path={"/dashboard/writing"} component={AIWriting} />
      <Route path={"/threadline"} component={Threadline} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <NotificationCenter />
          <VisitorAssistant />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
