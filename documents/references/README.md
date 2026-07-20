# Reference letters

Add the approved PDF letters to this folder using these names:

- `cambridge-reference.pdf`
- `uzh-reference.pdf`
- `vjti-reference.pdf`

Before publishing a letter, confirm that the referee has agreed to public display and remove private contact details if needed. The portfolio currently shows a safe “Letter being added” state, so there are no broken document links.

To activate a letter, replace the corresponding `document-status` span in `index.html` with:

```html
<a class="document-status" href="documents/references/cambridge-reference.pdf" target="_blank" rel="noopener">
  <i class="uil uil-file-download-alt"></i> Read reference letter
</a>
```

Use the matching filename for UZH and VJTI.
