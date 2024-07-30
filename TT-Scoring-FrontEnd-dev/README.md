update logs:

We added features to fulfill following user stories in Sprint 2 (2024.03.25-2024.05.02)

+ view our product demo at
  +  https://youtu.be/Fm2SH1FEX0A (sprint2)
  + https://www.youtube.com/watch?v=OY3Lyu7BlrQ (sprint3)
  + https://youtu.be/hB0Ui_gUguw (final product)

User stories fulfilled:  

| User Story ID | Description                                                  | Points | Priority |
| :------------ | :----------------------------------------------------------- | :----- | :------- |
| US001         | As a test developer, I want a user-friendly, secure, functional interface. | 29     | High     |
| US002         | As a test developer, I want to implement a secure login system and a reliable database, so that I can securely store and protect user data and system information. | 29     | High     |
| US003         | As a test develop, I want to construct, preserve, and eliminate tests as needed, so that I can efficiently manage the lifecycle of tests. | 67     | Low      |
| US004         | As a test developer, I want to have the ability to add and delete items (questions) within existing tests to adapt the tests as needed. | 24     | Medium   |
| US005         | As a test developer, I want to have the ability to add, edit, and delete test keys (correct answers) to ensure the validity of the tests we develop. | 6      | Medium   |
| US006         | As a test developer, I want to have flexibility in defining scoring rules, so that I can specify whether the scoring system is dichotomous (e.g., correct/incorrect) or allows partial scoring. | 1      | Medium   |
| US007         | As a test developer, I want to have options to handle different types of answers: Ignore case sensitivity, flag answers for manual marking if partially matched, handle spelling mistakes or minor grammatical errors. | 5      | Medium   |
| US008         | As a test developer, I want to have a secure and friendly environment, so that I can work in a stress-free atmosphere and ensure the integrity of the tests. | 13     | Medium   |
| US009         | As a test developer, I want to publish the test after everything is confirmed, so that I can guarantee the test is accurate and ready for test takers. | 5      | Medium   |
| US010         | As a test developer, I want the system to automatically evaluate test taker responses based on predefined rules, so that we can efficiently assess transcription ability. | 32     | Medium   |
| US011         | As a test developer, I want to upload test taker answers from an Excel file, and the system should handle trimming extra spaces and multi-word answers, so that the assessment process is streamlined. | 9      | Medium   |
| US012         | As a test developer, I want to have the ability to download or copy marked answers result for further analysis, reporting, and maintaining records, so that we can track and improve test taker performance. | 4      | High     |
| US013         | As a test developer, I want to have the ability to assign marker to tests, so that the marking process is organised and efficient. | 7      | Medium   |



# 1. TT-Scoring Project Introduction

## Project Overview

The transcript test project aims to develop an interactive system for managing and scoring tests. This platform will cater to various user roles, including administrators, test developers and markers. Each of them has distinct access levels and capabilities. The core functions of this project are about automatic scoring of text-based answers, enhancing the efficiency and accuracy beyond conventional methods (spreadsheets).

Goals: 

- User role definition
  - Develop a clear hierarchy of user roles (Admin, Test Developer, Marker) with specific access rights.
  - Ensure Admin has comprehensive control over the management and settings
- Test development
  - Enable test developers to create, edit, and manage tests
  - Incorporate a flexible test key system that allows for similar answers and partial scoring
  - Handle specific cases (e.g. blank, case sensitivity)
- Manual marking
  - Create an intuitive interface for markers to review and score flagged answers
- User interaction
  - Ensure all users have access to relevant features like password updating and test data downloading 

This project aims to upgrade the ways that tests are created, administered, and scored. By integrating scoring system with user-friendly management tools, the platform will significantly improve the efficiency of test evaluations.



## Tech Stack

+ FrontEnd: Next.js (on top of React.js)
+ BackEnd: Nest.js
  + using REST API
+ Database: MongoDB





##  File Structure

```ts
|- docs/: containing project documentation files 
|- src/
    |- tt-frontend/: FrontEnd code here (in next.js)
		|- tt-backend/: BakcEnd code here (in nest.js)
README.md
  
```





# 2. Project Coding Standards

## 2.1 Front-End

file structure

---

````ts
src
|-- app: Next.js app route folder, containing routing logic
|-- components: put reusable react component here, ending with ".tsx"
|-- utils: put utility function (ending with .ts) here
			|-- http.ts: put http request-resonse here, just return response, no need to extract info from the response
|-- interface: put reusable interface and type here
|-- hooks: put custom hooks here
|-- context: put context here to manage global state
````

Next.js app route, at least learn below topic:

- routing fundamentals [https://nextjs.org/docs/app/building-your-application/routing](https://nextjs.org/docs/app/building-your-application/routing)
- defining route
- pages and layouts
- Linking and Navigation
- Project Organisation
- dynamic route



file and function naming

---

- file naming
  - react component file (ending in .tsx): Camel start with uppercase e.g. MyComponent.tsx
  - utility file (ending in ts): camel but start with lower case  e.g. http.ts, formatTime.ts
- function
  - Readable function name: function name should be readable & self-explanatory. Try to make other developer get to understand what your are doing in the function just by reading the function name without reading its implementations
  - Single-responsibility: a function should have single-responsibility. Don't put too many different kinds of  logic in a single function.
    - e.g. in a loginRequest() function, just send http request and return the response, no need to put logic for further extracting useful information in the response
  - Avoid being too chatty: if you just have a few lines of code logic or the logic is not reusable, no need to wrap the code in a function



React component 

---

- write react component in 3 parts: hooks, handlers, jsx
- use TypeScript for type safety
  - to explicitly declare the type of props of a component
  - try to avoid declare a variable as 'any' type
- put try-catch code block in handler function in a component (to facilitate showing error modal etc.), utility function only throws error
- Avoid excessively long jsx code in return statement.
  - Read the component code in a bottom-up way.

A sample react component file: 

```tsx
interface Component1Props {
	props1: string,
	props2: number
}

// use functional component
const Component1 = ({props1, props2}:Component1Props) => {
	// part1: hooks declaration ------------------------------
	const [state1, setState1] = useState<boolean>(false);
	const router = useRouter()
	const modal = useModal()
	
	// part2: handlers ---------------------------------------
	// naming: actionNameHandler
	const action1Handler = () => {
	
		try{
			// ... other code
			const response = loginRequest(arg1, arg2)
			
			//... futher logic that extracts info from response
			
		}catch(e){
			modal(
				message: `error: ${error.message}`
			)
		}
	
	}
	
	const submitFormHandler = async => {
			
	}
	
	// part3: jsx ---------------------------------------
	// avoid excessive long jsx code block in return()
	const tableHeader = <div>...very long code</div>
	const tableBody = <div>...very long code</div>
	
	return (
		<>
			...other code
			
			{tableHeader}
			{tableBody}
		</>
	)
}
```





# 3. Project naming conventions

## Branch Naming Convention

Using prefixes in branch names enhances clarity about their purpose. Here are common branch types with their corresponding prefixes: 

\- **Feature Branches:** feature/ (e.g., feature/audio-chat). 

\- **Bugfix Branches:** bugfix/ (e.g., bugfix/wrong-score). 

\- **Hotfix Branches:** hotfix/ for critical production bug fixes (e.g., hotfix/critical-payment-issue). 

\- **Release Branches:** For releases I prefer using tags. Create and apply release tag to the release commit. OR We can also use **release/** for preparing new production releases (e.g., **release/v1.0.1**).



Some basic rules: 

> 1. **Lowercase and Hyphen-Separated:** Stick to lowercase for branch names and use hyphens to separate words. 
>
> Example: 
>
> Correct ✅: **feature/audio-chat** or **bugfix/wrong-score**.
>
> Wrong ❌: **Feature/AudioChat**
>
> 2. **Alphanumeric Characters:** Use only alphanumeric characters (**a-z, 0–9**) and hyphens. Avoid punctuation, spaces, underscores, or any non-alphanumeric character. 
>
> Correct ✅: **feature/audio-chat** or **bugfix/wrong-score**.
>
> Wrong ❌: **feature/audio chat, feature/audio_chat**
>
> 3. **No Continuous Hyphens:** Avoid continuous hyphens as they can be confusing and hard to read. 
>
> Correct ✅: **feature/audio-chat**
>
> Wrong ❌: **feature/audio--chat**
>
> 4. **No Trailing Hyphens:** Do not end your branch name with a hyphen. 
>
> Correct ✅: **feature/audio-chat**
>
> Wrong ❌: **feature/audio-chat-**
>
> 5. **Descriptive:** Branch names should be descriptive and concise, ideally reflecting the work done on the branch. Don't use developer names in the branch, which I have observed in beginner developers. 
>
> Correct ✅: **feature/audio-chat**
>
> Wrong ❌: **kiran-dev (kiran is the dev name)**



Reference: https://www.linkedin.com/pulse/naming-conventions-git-branches-kiran-javvaji-6fuac





## Commit Message Convention

Conventional Commit is a formatting convention that provides a set of rules to formulate a consistent commit message structure like so:

```ts
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The commit type can include the following:

- `feat` – a new feature is introduced with the changes
- `fix` – a bug fix has occurred
- `chore` – changes that do not relate to a fix or feature and don't modify src or test files (for example updating dependencies)
- `refactor` – refactored code that neither fixes a bug nor adds a feature
- `docs` – updates to documentation such as a the README or other markdown files
- `style` – changes that do not affect the meaning of the code, likely related to code formatting such as white-space, missing semi-colons, and so on.
- `test` – including new or correcting previous tests
- `perf` – performance improvements
- `ci` – continuous integration related
- `build` – changes that affect the build system or external dependencies
- `revert` – reverts a previous commit



Examples

Good

- `feat: improve performance with lazy load implementation for images`
- `chore: update npm dependency to latest version`
- `fix: fix bug preventing users from submitting the subscribe form`
- `Update incorrect client phone number within footer body per client request`

Bad

- `fixed bug on landing page`
- `Changed style`
- `oops`
- `I think I fixed it this time?`
- empty commit messages



References: https://www.freecodecamp.org/news/how-to-write-better-git-commit-messages/



