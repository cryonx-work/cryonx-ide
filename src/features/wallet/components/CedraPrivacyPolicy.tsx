import { forwardRef, ReactNode } from "react";
import { SmallCedraLogo } from "./graphics/SmallCedraLogo";
import { HeadlessComponentProps , createHeadlessComponent } from "./utils";

export const CEDRA_PRIVACY_POLICY_URL = "https://cedralabs.com/privacy";

const Root = createHeadlessComponent("CedraPrivacyPolicy.Root", "div");

const Disclaimer = createHeadlessComponent(
  "CedraPrivacyPolicy.Disclaimer",
  "span",
  { children: "By continuing, you agree to Cedra Labs'" },
);

const Link = createHeadlessComponent("CedraPrivacyPolicy.Disclaimer", "a", {
  href: CEDRA_PRIVACY_POLICY_URL,
  target: "_blank",
  rel: "noopener noreferrer",
  children: "Privacy Policy",
});

const PoweredBy = forwardRef<
  HTMLDivElement,
  Pick<HeadlessComponentProps, "className">
>(({ className }, ref) => {
  return (
    <div ref={ref} className={className}>
      <span>Powered by</span>
      <SmallCedraLogo />
      <span>Cedra Labs</span>
    </div>
  );
});
PoweredBy.displayName = "CedraPrivacyPolicy.PoweredBy";

/**
 * A headless component for rendering the Cedra Labs privacy policy disclaimer
 * that should be placed under the Cedra Connect login options.
 */
export const CedraPrivacyPolicy = Object.assign(Root, {
  Disclaimer,
  Link,
  PoweredBy,
});
