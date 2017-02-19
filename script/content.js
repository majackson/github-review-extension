const ISSUE_ROW_SELECTOR = '.table-list-issues .table-list-item';
const ISSUE_ROW_LINK_SELECTOR = '.issue-title a';
const ISSUE_ROW_SUMMARY_HOLDER_SELECTOR = '.issue-title::after';
const PR_COMMENT_SELECTOR = '.comment .comment-content';
const PLUS_ONE_MARKUP = `<img class="emoji" title=":+1:" alt=":+1:" src="/images/icons/emoji/unicode/1f44d.png" height="20" width="20" align="absmiddle">`;

let github_pr_tool = {
    init() {
        this.process_prs(document);
    },

    process_prs(elem) {
        let pr_rows = elem.querySelectorAll(ISSUE_ROW_SELECTOR);
        for (let pr_row of Array.from(pr_rows)) {
            this.process_pr_row(pr_row);
        }
    },

    process_pr_row(pr_row) {
        let pr_url = pr_row.querySelector(ISSUE_ROW_LINK_SELECTOR).getAttribute('href');
        fetch(pr_url, {credentials: 'include'}).then((response) => { 
            return response.text();
        }).then((text) => {
            let pr_page = document.createElement('div');
            pr_page.innerHTML = text;
            this.process_pr_page(pr_page, pr_row);
        })
    },

    process_pr_page(pr_page, pr_row) {
        let comments = Array.from(pr_page.querySelectorAll(PR_COMMENT_SELECTOR));
        let total_plus_ones = comments.map(
            this.contains_plus_one
        ).map(Number).reduce(
            (a, b) => { return a + b; }, 0
        );
        this.annotate_row(pr_row, total_plus_ones);
    },

    contains_plus_one(comment) {
        let emojis = Array.from(comment.querySelectorAll('.emoji'));
        let plus_ones = emojis.map(emoji => {
            return (emoji.title == ':+1:')? true : false;
        });
        return plus_ones.some(e => { return e; });
    },

    annotate_row(pr_row, plus_one_count) {
        let rowMarkup = '';

        if (plus_one_count > 3) {  // aggregate them instead of cluttering the row too much
            rowMarkup = `${PLUS_ONE_MARKUP}x${plus_one_count}`;
        }
        else {
            rowMarkup = PLUS_ONE_MARKUP.repeat(plus_one_count);
        }

        pr_row.querySelector(ISSUE_ROW_LINK_SELECTOR).insertAdjacentHTML(
            'afterend',
            rowMarkup
        );
    }
};

github_pr_tool.init();
