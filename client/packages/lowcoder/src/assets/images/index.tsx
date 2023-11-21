//window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
import { ReactComponent as LogoIcon } from "./etisoftware.svg";
import { ReactComponent as LogoWithNameIcon } from "./etisoftware.svg";
import { ReactComponent as LogoHomeIcon } from "./etisoftware.svg";

export { default as favicon } from "./etisoftware-favicon.svg";

export const Logo = (props: { branding?: boolean }) => {
  return <LogoIcon height="40px" width="120px" />;
};
export const LogoWithName = (props: { branding?: boolean }) => {
  return <LogoWithNameIcon />;
};
export const LogoHome = (props: { branding?: boolean }) => {
  return <LogoHomeIcon height="40px" width="120px" />;
};
