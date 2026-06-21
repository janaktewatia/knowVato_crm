// Public site block renderer — delegates to the shared renderer so the public
// site and the page-builder preview always stay in sync.
import { RenderBlock } from "../blocks/SharedBlocks";

export default function BlockRenderer({ block, theme }) {
  return <RenderBlock block={block} theme={theme || {}} />;
}
