import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { TinySelections, TinyHooks, TinyDom } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.api.dom.RangeExpandTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const textEntry = 'A B ' + Unicode.nbsp + 'C D';

  const makeBaseRange = (editor: Editor, startOffset: number, endOffset: number, nodeOffset: number = 0) => {
    const body = editor.getBody();
    const range = editor.dom.createRng();
    const node = body.childNodes[0].childNodes[nodeOffset];
    range.setStart(node, startOffset);
    range.setEnd(node, endOffset);
    return range;
  };

  const compareRanges = (range1: Range, range2: Range) => {
    assert.equal(range1.startContainer, range2.startContainer, 'Mismatching start container');
    assert.equal(range1.startOffset, range2.startOffset, 'Mismatching start offset');
    assert.equal(range1.endContainer, range2.endContainer, 'Mismatching end container');
    assert.equal(range1.endOffset, range2.endOffset, 'Mismatching end offset');
  };

  const assertRange = (editor: Editor, rng: Range, startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
    const startContainer = Hierarchy.follow(TinyDom.body(editor), startPath).getOrDie();
    const endContainer = Hierarchy.follow(TinyDom.body(editor), endPath).getOrDie();

    Assertions.assertDomEq('Should be expected start container', startContainer, SugarElement.fromDom(rng.startContainer));
    assert.equal(rng.startOffset, startOffset, 'Should be expected start offset');
    Assertions.assertDomEq('Should be expected end container', endContainer, SugarElement.fromDom(rng.endContainer));
    assert.equal(rng.endOffset, endOffset, 'Should be expected end offset');
  };

  it('TINY-9001: The content is empty', () => {
    const editor = hook.editor();
    editor.setContent('');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 0);
    const startRange = editor.selection.getRng();
    const expandedRange = RangeUtils(editor.dom).expand(startRange);
    assertRange(editor, expandedRange, [ 0 ], 0, [ 0 ], 1);
  });

  it('TINY-9001: The cursor is in between two spaces', () => {
    const editor = hook.editor();
    editor.setContent(textEntry);
    const startRange = makeBaseRange(editor, 4, 4);
    const endRange = RangeUtils(editor.dom).expand(startRange);
    compareRanges(startRange, endRange);
  });

  it('TINY-9001: The cursor is between a space and a word on the right', () => {
    const editor = hook.editor();
    editor.setContent(textEntry);
    const startRange = makeBaseRange(editor, 5, 5);
    const endRange = RangeUtils(editor.dom).expand(startRange);
    compareRanges(makeBaseRange(editor, 5, 6), endRange);
  });

  it('TINY-9001: The cursor is between a space and a word on the left', () => {
    const editor = hook.editor();
    editor.setContent(textEntry);
    const startRange = makeBaseRange(editor, 3, 3);
    const endRange = RangeUtils(editor.dom).expand(startRange);
    compareRanges(makeBaseRange(editor, 2, 3), endRange);
  });

  it('TINY-9001: The cursor is in the middle of a word', () => {
    const editor = hook.editor();
    editor.setContent('<p>A B12C D</p>');
    const startRange = makeBaseRange(editor, 4, 4);
    const endRange = RangeUtils(editor.dom).expand(startRange);
    compareRanges(makeBaseRange(editor, 2, 6), endRange);
  });
});
