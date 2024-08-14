This page tests custom Tailwind entrypoints. This feature is useful when non-Markdown files in your vault contain Tailwind CSS classnames and use them to dynamically generate Markdown content.

This example uses the [Dataview](https://github.com/blacksmithgu/obsidian-dataview) plugin in a contrived way to produce a paragraph with some classnames. One classname uses an interpolated string, which breaks Tailwind (see notes on [dynamic class names](https://tailwindcss.com/docs/content-configuration#dynamic-class-names)).

Realistically, you might have some other template files that use proper Tailwind classnames, but still aren't a part of your vault's Markdown files.

If you list `custom-tailwind.txt` in the custom Tailwind entrypoint list, then the paragraph below should gain some padding.

```dataviewjs
const paddingAmount = 8;
dv.el(
	'p',
	'This paragraph is rendered using the Dataview plugin',
	{
		cls: `border-red-500 border-solid p-${paddingAmount}`
	}
);
```
