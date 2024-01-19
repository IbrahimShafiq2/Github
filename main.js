// Define a class named GitHubApp
class GitHubApp {
    // Constructor initializes class properties and calls the init method
    constructor() {
        this.elements = this.getElements(); // Get DOM elements and store them in the 'elements' property
        this.repoItems = []; // Initialize an empty array to store repository items
        this.init(); // Call the init method to set up event listeners and other initializations
    }

    // Get DOM elements and return them in an object
    getElements() {
        return {
            // Select various DOM elements and store them in properties
            h1: document.querySelector('h1'),
            searchInput: document.querySelector('input'),
            languagesRepo: document.querySelector('.languages'),
            repoSearchedItemDiv: document.querySelector('.repo-searched-item'),
            repos: document.querySelector('.repos'),
            getReposBtn: document.querySelector('.get-repos-btn'),
            userName: document.querySelector('.user-name h2'),
            userImage: document.querySelector('img'),
            userFollowersStats: document.querySelector('.user-stats .followers-stats'),
            userFollowingStats: document.querySelector('.user-stats .following-stats'),
            userReposStats: document.querySelector('.user-stats .repos-stats'),
            userBio: document.querySelector('.bio'),
            modal: document.querySelector('.modal'),
            closeBtn: document.querySelector('.close-btn'),
            textError: document.querySelector('.alert-content .content p:nth-child(2)'),
            imagePreview: document.querySelector('.img-preview'),
            imageMagnifier: document.querySelector('.img-magnifier'),
            imagePreviewerCloseBtn: document.querySelector('.img-preview .fa-xmark'),
            user: '',
        };
    }

    // Initialize the application, setting up event listeners and initial UI state
    init() {
        // Set up event listeners for various UI interactions
        this.elements.getReposBtn.addEventListener('click', () => this.gettingRepos());
        this.elements.closeBtn.addEventListener('click', () => this.closeModal());
        this.elements.userImage.addEventListener('click', () => this.openImagePreviewer());
        this.elements.imagePreviewerCloseBtn.addEventListener('click', () => this.closeImagePreviewer());

        // Set up event listeners to close modal on clicking outside or pressing the Escape key
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) this.closeModal();
            if (e.target.classList.contains('img-magnifier')) this.closeImagePreviewer();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'Escape') this.closeImagePreviewer();
        });

        // Set the name of the project in the header and document title
        this.elements.h1.textContent = 'Github App';
        document.title = 'Github App';
    }

    // Handle the process of getting user repositories
    gettingRepos() {
        // Get the username from the input field
        this.user = this.elements.searchInput.value.trim();

        // Check if the username is provided
        if (this.user) {
            // Clear existing content, fetch repositories, and user data
            this.clearContent();
            this.fetchingRepos(this.user);
            this.fetchingUserData(this.user);
        } else {
            // Show an error message in a modal if the username is not provided
            this.openModalWithErrorMessage('Please enter a valid username.');
        }
    }

    // Fetch user repositories from the GitHub API
    fetchingRepos(user) {
        const apiUrl = `https://api.github.com/users/${user}/repos`;
        // Fetch data from the API and handle the response
        this.fetchData(apiUrl)
            .then(data => {
                // Display used languages and all repositories
                this.displayUsedLanguages(data);
                this.displayAllRepos(data);
            })
            .catch(error => console.log(error));
    }

    // Fetch user data from the GitHub API
    fetchingUserData(user) {
        const apiUrl = `https://api.github.com/users/${user}`;
        // Fetch data from the API and update the user interface
        this.fetchData(apiUrl)
            .then(data => this.userUI(data))
            .catch(error => console.log(error));
    }

    // Update the user interface with user data
    userUI(userData) {
        const { userName, userImage, userFollowersStats, userFollowingStats, userReposStats, userBio } = this.elements;
        userName.textContent = userData.name;
        userImage.setAttribute('src', userData.avatar_url);
        userFollowersStats.textContent = userData.followers;
        userFollowingStats.textContent = userData.following;
        userReposStats.textContent = userData.public_repos;
        userBio.textContent = userData.bio;
    }

    // Display used programming languages in the UI
    displayUsedLanguages(usedLanguages) {
        const usedReposLanguages = new Set(usedLanguages.map(repo => repo.language).filter(language => language));
        usedReposLanguages.forEach(language => this.appendLanguage(language));
    }

    // Append a programming language to the UI
    appendLanguage(language) {
        const liElement = document.createElement('li');
        liElement.textContent = language;
        liElement.setAttribute('data-language', `${language}`.toLowerCase());
        this.elements.languagesRepo.appendChild(liElement);
    
        liElement.addEventListener('click', function() {
            const clickedLanguage = this.getAttribute('data-language');
            gitHubApp.generatingClickedElementRepos(clickedLanguage);
        });
    }

    // Display all repositories in the UI
    displayAllRepos(allRepos) {
        // Extract the 'items' property if it exists, otherwise use the provided data directly
        const reposData = allRepos.items || allRepos;

        // Create repository items, append them to the UI, and animate them
        this.repoItems = reposData.map((repo, i) => {
            const repoItem = this.createRepoItem(repo, i);
            this.elements.repos.appendChild(repoItem);
            return repoItem;
        });

        // If all repositories are displayed, add a summary for all repositories
        if (reposData.length === this.elements.repos.childElementCount) {
            const repoSearchedItem = document.createElement('p');
            repoSearchedItem.textContent = `All`;
            this.elements.repoSearchedItemDiv.appendChild(repoSearchedItem);
        }

        // Animate the repository items
        this.animateRepoItems();
    }

    // Animate repository items
    animateRepoItems() {
        this.repoItems.forEach((item, i) => {
            setTimeout(() => {
                item.style.left = '0px';
            }, i * 100);
        });
    }

    // Create a single repository item in the UI
    createRepoItem(repoData, index) {
        const repoItem = document.createElement('a');
        repoItem.setAttribute('href', repoData.html_url);
        repoItem.setAttribute('target', '_blank');
        repoItem.classList.add('repo-item');
        if (index == 0) repoItem.style.left = `${-80}px`;
        else repoItem.style.left = `${-100 * index}px`;

        const repoFullName = document.createElement('span');
        repoFullName.textContent = repoData.full_name.replace(/^[^/]+\//, '');
        repoFullName.classList.add('repo-name');

        const repoDetails = document.createElement('div');
        repoDetails.classList.add('repo-details');

        const repoIssues = document.createElement('div');
        repoIssues.classList.add('repo-issues');

        const icon = document.createElement('i');
        const repoIssuesContent = document.createElement('span');

        // Determine if there are open issues and set the corresponding icon and content
        if (repoData.open_issues > 0) {
            icon.classList.add('fa-solid', 'fa-xmark');
            repoIssuesContent.textContent = `${repoData.open_issues} issues`;
        } else {
            icon.classList.add('fa-solid', 'fa-check');
            repoIssuesContent.textContent = `0 issues`;
        }

        repoIssues.appendChild(icon);
        repoIssues.appendChild(repoIssuesContent);

        const repoWatchers = document.createElement('div');
        repoWatchers.classList.add('repo-watchers');

        const watchersIcon = document.createElement('i');
        watchersIcon.classList.add('fa-solid', 'fa-eye');

        const watchersSpan = document.createElement('span');
        watchersSpan.textContent = `${repoData.watchers} Watchers`;

        const repoDate = document.createElement('div');

        const repoDateIcon = document.createElement('i');
        repoDateIcon.classList.add('fa-solid', 'fa-calendar');
        repoDate.appendChild(repoDateIcon);

        const repoDateSpan = document.createElement('span');
        
        // Calculate the difference in years between the current date and the last push date
        const dateString = `${repoData.pushed_at}`;
        const inputDate  = new Date(dateString);
        const currentDate = new Date();

        const timeDifference = currentDate - inputDate;

        const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;
        const yearsDifference = timeDifference / millisecondsInYear;

        const repoDateSpanContent = document.createTextNode(`${Math.floor(yearsDifference)} Years Ago`);
        repoDateSpan.appendChild(repoDateSpanContent)
        repoDate.appendChild(repoDateSpan);

        repoWatchers.appendChild(watchersIcon);
        repoWatchers.appendChild(watchersSpan);

        repoDetails.appendChild(repoIssues);
        repoDetails.appendChild(repoWatchers);
        repoDetails.appendChild(repoDate);

        repoItem.appendChild(repoFullName);
        repoItem.appendChild(repoDetails);

        return repoItem;
    }

    // Fetch repositories based on a clicked language
    generatingClickedElementRepos(item) {
        const apiUrl = `https://api.github.com/search/repositories?q=user:${this.user}+language:${item}`;
        this.fetchData(apiUrl)
            .then(data => {
                this.elements.repos.innerHTML = '';
                this.displayAllRepos(data);
                const repoSearchedItem = document.createElement('p');
                repoSearchedItem.textContent = item;
                this.elements.repoSearchedItemDiv.innerHTML = '';
                this.elements.repoSearchedItemDiv.appendChild(repoSearchedItem);
            })
            .catch(err => this.errorHandling(err));
    }

    // Clear content from the UI
    clearContent() {
        // Clear used languages, repository items, and searched item
        this.elements.languagesRepo.innerHTML = '';
        this.elements.repos.innerHTML = '';
        this.elements.repoSearchedItemDiv.innerHTML = '';
    }

    // Open the modal
    openModal() {
        this.elements.modal.classList.replace('d-none', 'd-flex');
    }

    // Open the image previewer
    openImagePreviewer() {
        this.elements.imageMagnifier.classList.replace('d-none', 'd-flex');
        this.elements.imagePreview.style.backgroundImage = '';
        let userImageSrc = this.elements.userImage.getAttribute('src');
        console.log(userImageSrc);
        this.elements.imagePreview.style.backgroundImage = `url('${userImageSrc}')`;

    }
    
    // Close the image previewer
    closeImagePreviewer() {
        this.elements.imageMagnifier.classList.replace('d-flex', 'd-none');
    }

    // Close the modal
    closeModal() {
        this.elements.modal.classList.replace('d-flex', 'd-none');
    }

    // Open modal with an error message
    openModalWithErrorMessage(message) {
        this.openModal();
        this.elements.textError.textContent = message;
    }

    // Fetch data from an API
    async fetchData(apiUrl) {
        try {
            const res = await fetch(apiUrl);
            return await res.json();
        } catch (error) {
            // Show an error message in a modal if fetching fails
            this.openModalWithErrorMessage('Error fetching data. Please try again.');
            throw error;
        }
    }

    // Handle errors
    errorHandling(err) {
        // Log errors to the console
        console.error(err);
    }
}

// Create an instance of the GitHubApp class when the script runs
const gitHubApp = new GitHubApp();
