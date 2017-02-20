const ISSUE_ROW_SELECTOR = '.issues-listing .js-issue-row';
const ISSUE_ROW_LINK_SELECTOR = 'a.js-navigation-open';
const ISSUE_ROW_SUMMARY_HOLDER_SELECTOR = 'a.js-navigation-open::after';

const COMMENT_SELECTOR = '.comment .comment-body:not(.js-preview-body)';
const REVIEW_COMMENT_SELECTOR = '.discussion-item';
const REVIEW_AUTHOR = '.author';
const REVIEW_APPROVAL_MARKER = '.discussion-item-icon .octicon-check';
const REVIEW_DENY_MARKER = '.discussion-item-icon .octicon-x';
const REVIEW_QUESTION_MARKER = '.discussion-item-icon .octicon-eye';

const APPROVAL_MARKUP = `<img class="emoji" title=":+1:" alt=":+1:" src="/images/icons/emoji/unicode/1f44d.png" height="20" width="20" align="absmiddle">`;
const DENIAL_MARKUP = `<img class="emoji" title=":-1:" alt=":-1:" src="/images/icons/emoji/unicode/1f44e.png" height="20" width="20" align="absmiddle">`;
const QUESTION_MARKUP = `<img class="emoji" title=":question:" alt=":question:" src="/images/icons/emoji/unicode/2753.png" height="20" width="20" align="absmiddle">`;

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
        let review_comments = pr_page.querySelectorAll(REVIEW_COMMENT_SELECTOR);
        review_totals = this.sum_reviews(
            Object.values(
                this.bucket_reviewers(review_comments)
            ).map(this.process_contributor_reviews)
        );

        let last_comment = Array.from(pr_page.querySelectorAll(COMMENT_SELECTOR)).pop();
        review_totals['questions'] = this.comment_is_question(last_comment)? 1 : review_totals['questions'];

        this.annotate_row(pr_row, review_totals);
    },

    bucket_reviewers(reviews) {
        // takes a list of reviews, and buckets them by reviewer
        let reviews_map = {};

        for (let review of Array.from(reviews)) {
            let reviewer = review.querySelector(REVIEW_AUTHOR);
            reviews_map[reviewer] = (reviews_map[reviewer] || []).concat(review);
        }

        return reviews_map;
    },

    process_contributor_reviews(reviews) {
        // an individual has several reviews, they may review something down initially, then a fix
        // occurs, and they give a positive result afterwards. This function manages that changing
        // process.
        let approvals = 0, denials = 0, questions = 0;
        
        for (let review of Array.from(reviews).reverse()) {
            if (review.querySelector(REVIEW_APPROVAL_MARKER)) {
                approvals += 1;            
                break;  // we only care about the most recent approve/deny
            } else if (review.querySelector(REVIEW_DENY_MARKER)) {
                denials += 1;
                break;  // we only care about the most recent approve/deny
            } else if (review.querySelector(REVIEW_QUESTION_MARKER)) {
                questions += 1;  // but we're going to keep iterating after a question to find an approve/deny
            }
        }
        
        return {
            approvals: approvals,
            denials: denials,
            questions: questions
        };
    },

    sum_reviews(reviews) {
        // takes multiple sets of reviews, and squashes them together into one set of annotations
        return {
            approvals: reviews.map(r => r['approvals']).reduce((a, b) => a + b, 0),
            denials: reviews.map(r => r['denials']).reduce((a, b) => a + b, 0),

            // show a max of one question, otherwise it gets a bit crazy
            questions: Math.min(reviews.map(r => r['questions']).reduce((a, b) => a + b, 0), 1)
        }
    },

    comment_is_question(comment) {
        // this is a very naive function that just looks for a question mark in the comment markup.
        // It will fail if, for example, a question mark appears in the URL of something linked from the comment.
        // Would be good to improve this.
        return comment.innerHTML.indexOf('?') != -1;
    },

    annotate_row(pr_row, annotations) {
        let rowMarkup = '';

        for (let [type, markup] of [['approvals', APPROVAL_MARKUP], ['denials', DENIAL_MARKUP], ['questions', QUESTION_MARKUP]]) {
            if (annotations[type] > 3) {  // aggregate them instead of cluttering the row too much
                rowMarkup += `${markup}x${annotations[type]}`;
            }
            else {
                rowMarkup += markup.repeat(annotations[type]);
            }
        }

        pr_row.querySelector(ISSUE_ROW_LINK_SELECTOR).insertAdjacentHTML(
            'afterend',
            rowMarkup
        );
    }
};

github_pr_tool.init();
