import { Slot } from "@radix-ui/react-slot";
import { ReactNode, cloneElement, forwardRef, isValidElement } from "react";

function isReactElementWithProps(
    child: ReactNode
): child is React.ReactElement<{ children?: ReactNode }> {
    return isValidElement(child);
}


export interface HeadlessComponentProps {
    /** A class name for styling the element. */
    className?: string;
    /**
     * Whether to render as the child element instead of the default element provided.
     * All props will be merged into the child element.
     */
    asChild?: boolean;
    children?: ReactNode;
}

/**
 * Gets an HTML element type from its tag name
 * @example
 * HTMLElementFromTag<"img"> // resolved type: HTMLImageElement
 */
type HTMLElementFromTag<T extends keyof React.JSX.IntrinsicElements> =
    React.JSX.IntrinsicElements[T] extends React.ClassAttributes<infer Element>
        ? Element
        : HTMLElement;

export function createHeadlessComponent<
    TElement extends keyof React.JSX.IntrinsicElements
>(
    displayName: string,
    elementType: TElement,
    props?:
        | React.JSX.IntrinsicElements[TElement]
        | ((displayName: string) => React.JSX.IntrinsicElements[TElement])
) {
    const component = forwardRef<
        HTMLElementFromTag<TElement>,
        HeadlessComponentProps
    >(({ className, asChild, children }, ref) => {
        const Component = asChild ? Slot : elementType;

        const { children: defaultChildren, ...resolvedProps } =
            typeof props === "function" ? props(displayName) : props ?? {};
        const resolvedChildren =
            /**
             * Use props' default children if no children are set in the component element's children and when asChild is true.
             */
            asChild && isReactElementWithProps(children) && !(children.props.children)
                ? cloneElement(children, {}, defaultChildren)
                : children ?? defaultChildren;

        return (
            /**
             * Due to the complexity of the types at play, TypeScript reports the
             * following error for our JSX below:
             *
             * `Expression produces a union type that is too complex to represent.`
             *
             * We can safely ignore this error and retain accurate return types for
             * consumers of this function. The only drawback is that type-checking is
             * ignored for the JSX block below.
             */
            // @ts-expect-error
            <Component ref={ref} className={className} {...resolvedProps}>
                {resolvedChildren}
            </Component>
        );
    });
    component.displayName = displayName;

    return component;
}

