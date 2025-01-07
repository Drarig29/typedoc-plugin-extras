import type { Application } from "typedoc";
import type { PluginOptions } from "./main.js";

/**
 * Appends a string value after "Generated using TypeDoc".
 * @param html HTML string to append to.
 * @param value A string value.
 */
export function appendToFooter(html: string, value: string): string {
    return html.replace(/(<p.*>Generated using.*TypeDoc.*)(<\/p>)/,
        '$1' + // Start of <p>
        value +
        '$2' // End of <p>
    );
}

/**
 * Sets up a space between the first line of the footer and the date.
 * @param html HTML string to append to.
 */
export function setupNewlineInFooter(html: string): string {
    return html.replace(/(<p)(>Generated using.*TypeDoc)/,
        '$1' + // Opening of <p> tag
        ' style="line-height: 28px;"' + // Add spacing between the first line of footer and the date.
        '$2' // End of "Generated using TypeDoc"
    );
}

/**
 * Replaces the top-most title text.
 * @param html HTML string to replace into.
 * @param title The new title to set.
 */
export function replaceTopMostTitle(html: string, title: string): string {
    return html.replace(/(<a href=")([^"]*)(" class="title">)([^<]*)(<\/a>)/,
        '$1' + // Start of <a>
        '$2' + // The href link
        '$3' + // The class
        title +
        '$5' // End of <a>
    );
}

/**
 * Replaces the meta description
 * @param html HTML string to replace into.
 * @param description The new description to set.
 */
export function replaceDescription(html: string, description: string): string {
    return html.replace(/(<meta name="description" content=")([^<]*)("\/>)/,
        '$1' + // Start of meta tag
        description.replace('"', '') + // The description (also preventing escaping the attribute)
        '$3' // end of meta tag
    );
}

export const getLastModifiedScript = () => {
    // Use English as the locale because we say "Last modified".
    // The title of the element (shown on hover) contains the locale string with the user's timezone.
    return `
        const formatter = new Intl.RelativeTimeFormat('en', {
            numeric: 'auto',
            style: 'short',
        });

        const divisions = [
            { amount: 60, name: 'seconds' },
            { amount: 60, name: 'minutes' },
            { amount: 24, name: 'hours' },
            { amount: 7, name: 'days' },
            { amount: 4.34524, name: 'weeks' },
            { amount: 12, name: 'months' },
            { amount: Number.POSITIVE_INFINITY, name: 'years' }
        ];

        function formatTimeAgo(date) {
            let duration = (date - new Date()) / 1000;
            
            for (const division of divisions) {
                if (Math.abs(duration) < division.amount) {
                    return formatter.format(Math.round(duration), division.name);
                }
                duration /= division.amount;
            }
        }

        document.getElementById('generation-date').title = new Date(window.GENERATION_DATE).toLocaleString();
        document.getElementById('generation-date').innerText = \`Last modified \${formatTimeAgo(window.GENERATION_DATE)}\`;
    `;
};

export const getDateTimeScript = (options: PluginOptions) => {
    const args = [];
    if (options.footerDate) args.push("dateStyle: 'medium'");
    if (options.footerTime) args.push("timeStyle: 'long'");

    // Use the browser's language since we just print a date.
    return `
        const formatter = new Intl.DateTimeFormat(navigator.language, {
            ${args.join(',')}
        });

        document.getElementById('generation-date').innerText = formatter.format(window.GENERATION_DATE);
    `;
};

export const deprecatedOption = (app: Application, { name, inFavorOf }: { name: string, inFavorOf: string }) => {
    if (app.options.getValue(name)) {
        const error = Error(`[typedoc-plugin-extras] The \`--${name}\` option is deprecated. Please use \`--${inFavorOf}\` instead.`)
        delete error.stack
        throw error
    }
}