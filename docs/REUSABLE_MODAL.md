# Reusable Modal

The shared component is available at:

client/src/components/ReusableModal.tsx

It is built on the installed Radix Dialog primitive. Focus containment, focus restoration, accessible dialog semantics, and keyboard interaction are delegated to the app's existing accessible dialog implementation rather than a custom focus trap.

## Controlled usage

~~~tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReusableModal } from "@/components/ReusableModal";

export function ExamplePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>Open modal</Button>

      <ReusableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Edit profile"
        description="Update the information shown on your profile."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Save changes</Button>
          </>
        }
      >
        <form className="space-y-4">
          {/* Put page-specific fields and content here. */}
        </form>
      </ReusableModal>
    </>
  );
}
~~~

## Public API

| Prop | Type | Default |
| --- | --- | --- |
| open | boolean | required |
| onOpenChange | (open: boolean) => void | required |
| title | string | required |
| description | string | — |
| children | ReactNode | required |
| footer | ReactNode | — |
| size | sm, md, lg, xl, full | md |
| closeOnBackdrop | boolean | true |
| closeOnEscape | boolean | true |
| showCloseButton | boolean | true |
| className | string | — |

## Reuse in another React app

Copy ReusableModal.tsx and its UI dependencies, or replace the imports with that app's dialog primitive, button, icon, and class-name utility. Keep the controlled public API stable. Move the Tailwind utility classes to CSS modules or design tokens if Tailwind is unavailable. Keep page-specific state, data fetching, validation, and save/cancel actions in the consuming page.

## Accessibility and behavior

- A required visible title labels the dialog; the description is optional.
- Radix manages modal focus containment and restores focus to the invoking element on close.
- Escape and outside-pointer dismissal are independently configurable.
- The close button has an accessible name and visible focus styling inherited from the shared Button.
- The body scrolls independently for long content; the header and optional footer remain available.
- The shared dialog primitive supplies the overlay and motion classes. Preserve its reduced-motion behavior when adapting styles.
