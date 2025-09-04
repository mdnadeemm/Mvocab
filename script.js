// Global variables for NLP
let nlp = null;
let modelLoaded = false;
let modelLoading = false;

// Show tab-specific loading indicator
function showTabLoading(tabName) {
    const loadingElement = document.getElementById(tabName + 'Loading');
    const contentElement = document.getElementById(tabName + 'Area');
    if (loadingElement) {
        loadingElement.style.display = 'block';
        contentElement.style.display = 'none';
    }
}

// Hide tab-specific loading indicator
function hideTabLoading(tabName) {
    const loadingElement = document.getElementById(tabName + 'Loading');
    const contentElement = document.getElementById(tabName + 'Area');
    if (loadingElement) {
        loadingElement.style.display = 'none';
        contentElement.style.display = 'block';
    }
}

// Update tab-specific progress
function updateTabProgress(tabName, percentage, message) {
    const progressFill = document.getElementById(tabName + 'ProgressFill');
    const progressText = document.getElementById(tabName + 'ProgressText');
    const loadingMessage = document.getElementById(tabName + 'LoadingMessage');
    
    if (progressFill) progressFill.style.width = percentage + '%';
    if (progressText) progressText.textContent = Math.round(percentage) + '%';
    if (loadingMessage && message) loadingMessage.textContent = message;
}

// Initialize NLP model with better error handling
function initializeNLPModel(tabName = 'frequency') {
    if (modelLoading) {
        return;
    }
    
    if (modelLoaded) {
        // If model is loaded, and the tab is visible, run the analysis
        if (document.getElementById(tabName + 'Content').style.display !== 'none') {
            const analysisFunction = window['display' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Analysis'];
            if (analysisFunction) {
                analysisFunction();
            }
        }
        return;
    }
    
    modelLoading = true;
    showTabLoading(tabName);
    updateTabProgress(tabName, 10, 'Initializing model...');

    setTimeout(async () => {
        try {
            // Load the wink-nlp model
            updateTabProgress(tabName, 30, 'Loading language model...');
            console.log('Starting to load NLP model...');
            
            // The correct way to load the model according to wink-nlp documentation
            const model = await window.winkEngLiteWebModel.load();
            updateTabProgress(tabName, 70, 'Initializing NLP engine...');
            
            // Create NLP instance
            nlp = window.winkNLP(model);
            modelLoaded = true;
            
            updateTabProgress(tabName, 90, 'Finalizing setup...');
            
            // Small delay to show completion
            await new Promise(resolve => setTimeout(resolve, 300));
            updateTabProgress(tabName, 100, 'Model loaded successfully!');
            
            console.log('NLP model loaded successfully');

            // If the tab is still active, run the analysis
            if (document.getElementById(tabName + 'Content').style.display !== 'none') {
                const analysisFunction = window['display' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Analysis'];
                if (analysisFunction) {
                    analysisFunction();
                }
            }

        } catch (error) {
            console.error('Error loading NLP model:', error);
            updateTabProgress(tabName, 0, 'Error loading model. Please try again.');
        } finally {
            modelLoading = false;
            hideTabLoading(tabName);
        }
    }, 0);
}

// Load NLP model when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get all DOM elements
    const fileInput = document.getElementById('fileInput');
    const processBtn = document.getElementById('processBtn');
    const wordList = document.getElementById('wordList');
    const definitionArea = document.getElementById('definitionArea');
    const sentenceArea = document.getElementById('sentenceArea');
    const frequencyArea = document.getElementById('frequencyArea');
    const complexityArea = document.getElementById('complexityArea');
    const collocationArea = document.getElementById('collocationArea');
    
    // Tab elements
    const wordTab = document.getElementById('wordTab');
    const sentenceTab = document.getElementById('sentenceTab');
    const frequencyTab = document.getElementById('frequencyTab');
    const complexityTab = document.getElementById('complexityTab');
    const collocationTab = document.getElementById('collocationTab');
    
    // Content areas
    const wordContent = document.getElementById('wordContent');
    const sentenceContent = document.getElementById('sentenceContent');
    const frequencyContent = document.getElementById('frequencyContent');
    const complexityContent = document.getElementById('complexityContent');
    const collocationContent = document.getElementById('collocationContent');
    
    // Pagination elements
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const paginationControls = document.getElementById('paginationControls');
    
    // Data storage
    let vocabWords = [];
    let sentences = [];
    let srtContent = '';
    let currentPage = 1;
    const sentencesPerPage = 5;
    let cleanText = ''; // For NLP analysis
    
    // Tab switching functionality
    wordTab.addEventListener('click', function() {
        setActiveTab(wordTab, [wordContent]);
        hideOtherContents([sentenceContent, frequencyContent, complexityContent, collocationContent]);
    });
    
    sentenceTab.addEventListener('click', function() {
        setActiveTab(sentenceTab, [sentenceContent]);
        hideOtherContents([wordContent, frequencyContent, complexityContent, collocationContent]);
        
        // Load sentences if we have them
        if (sentences.length > 0) {
            currentPage = 1;
            displaySentencesForPage(currentPage);
        }
    });
    
    frequencyTab.addEventListener('click', function() {
        setActiveTab(frequencyTab, [frequencyContent]);
        hideOtherContents([wordContent, sentenceContent, complexityContent, collocationContent]);
        
        // Generate frequency analysis if we have text
        if (cleanText) {
            initializeNLPModel('frequency');
        } else {
            frequencyArea.innerHTML = '<p>No text data available. Please process an SRT file first.</p>';
        }
    });
    
    complexityTab.addEventListener('click', function() {
        setActiveTab(complexityTab, [complexityContent]);
        hideOtherContents([wordContent, sentenceContent, frequencyContent, collocationContent]);
        
        // Generate complexity analysis if we have text
        if (cleanText) {
            initializeNLPModel('complexity');
        }
        else {
            complexityArea.innerHTML = '<p>No text data available. Please process an SRT file first.</p>';
        }
    });
    
    collocationTab.addEventListener('click', function() {
        setActiveTab(collocationTab, [collocationContent]);
        hideOtherContents([wordContent, sentenceContent, frequencyContent, complexityContent]);
        
        // Generate collocation analysis if we have text
        if (cleanText) {
            initializeNLPModel('collocation');
        }
        else {
            collocationArea.innerHTML = '<p>No text data available. Please process an SRT file first.</p>';
        }
    });
    
    // Set active tab and content
    function setActiveTab(activeTab, activeContents) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to clicked tab
        activeTab.classList.add('active');
        
        // Show active content and hide others
        activeContents.forEach(content => {
            content.style.display = 'flex';
        });
    }
    
    // Hide other content areas
    function hideOtherContents(contentsToHide) {
        contentsToHide.forEach(content => {
            content.style.display = 'none';
        });
    }
    
    // Extract vocabulary from SRT content
    function extractVocabulary(srtContent) {
        // Split content into lines
        const lines = srtContent.split(/\r?\n/);
        const words = new Set();
        
        // Process each line
        lines.forEach(line => {
            // Skip lines that are numbers or timestamps
            if (/^\d+$/.test(line.trim()) || line.includes('-->')) {
                return;
            }
            
            // Remove HTML tags if any
            line = line.replace(/<[^>]*>/g, '');
            
            // Skip empty lines
            if (line.trim() === '') {
                return;
            }
            
            // Split line into words and process each word
            line.split(/\s+/).forEach(word => {
                // Remove punctuation and convert to lowercase
                const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
                
                // Only include words with more than 3 characters
                if (cleanWord.length > 3) {
                    words.add(cleanWord);
                }
            });
        });
        
        // Convert Set to sorted Array
        return Array.from(words).sort();
    }
    
    // Extract sentences from SRT content
    function extractSentences(srtContent) {
        // Split content into lines
        const lines = srtContent.split(/\r?\n/);
        const sentences = [];
        let currentTextBlock = '';
        
        // Process each line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip lines that are numbers
            if (/^\d+$/.test(line)) {
                continue;
            }
            
            // If line contains timestamp, it marks the start of a new subtitle block
            if (line.includes('-->')) {
                // If we have accumulated text, save it as a sentence
                if (currentTextBlock.trim() !== '') {
                    sentences.push(currentTextBlock.trim());
                    currentTextBlock = '';
                }
                continue;
            }
            
            // Remove HTML tags if any
            const cleanLine = line.replace(/<[^>]*>/g, '');
            
            // If line is not empty, add it to current text block
            if (cleanLine !== '') {
                if (currentTextBlock !== '') {
                    currentTextBlock += ' ' + cleanLine;
                } else {
                    currentTextBlock = cleanLine;
                }
            }
        }
        
        // Don't forget the last text block
        if (currentTextBlock.trim() !== '') {
            sentences.push(currentTextBlock.trim());
        }
        
        return sentences;
    }
    
    // Extract clean text for NLP analysis
    function extractCleanText(srtContent) {
        // Split content into lines
        const lines = srtContent.split(/\r?\n/);
        let cleanText = '';
        
        // Process each line
        lines.forEach(line => {
            // Skip lines that are numbers or timestamps
            if (/^\d+$/.test(line.trim()) || line.includes('-->')) {
                return;
            }
            
            // Remove HTML tags if any
            line = line.replace(/<[^>]*>/g, '');
            
            // Skip empty lines
            if (line.trim() === '') {
                return;
            }
            
            // Add line to clean text
            if (cleanText !== '') {
                cleanText += ' ' + line.trim();
            } else {
                cleanText = line.trim();
            }
        });
        
        return cleanText;
    }
    
    // Display vocabulary words
    function displayWords(words) {
        wordList.innerHTML = '';
        
        words.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            li.addEventListener('click', function() {
                // Remove selected class from all items
                document.querySelectorAll('#wordList li').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Add selected class to clicked item
                this.classList.add('selected');
                
                // Show definition
                showDefinition(word);
            });
            wordList.appendChild(li);
        });
    }
    
    // Display sentences for current page
    async function displaySentencesForPage(page) {
        const startIndex = (page - 1) * sentencesPerPage;
        const endIndex = Math.min(startIndex + sentencesPerPage, sentences.length);
        const sentencesToDisplay = sentences.slice(startIndex, endIndex);
        
        sentenceArea.innerHTML = '<div class="loading">Loading sentence translations...</div>';
        
        try {
            let html = '';
            
            // Translate sentences for this page
            for (const sentence of sentencesToDisplay) {
                try {
                    // Fetch Hindi translation from MyMemory API
                    const translationResponse = await fetch(
                        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sentence)}&langpair=en|hi`
                    );
                    const translationData = await translationResponse.json();
                    
                    html += `<div class=\"sentence-item\">`;
                    html += `<div class=\"sentence-text\">${sentence}</div>`;
                    
                    if (translationData && translationData.responseData && translationData.responseData.translatedText) {
                        html += `<div class=\"sentence-translation\">Translation: ${translationData.responseData.translatedText}</div>`;
                    } else {
                        html += `<div class=\"sentence-translation\">Translation: Not available</div>`;
                    }
                    
                    html += `</div>`;
                } catch (error) {
                    console.error('Error translating sentence:', error);
                    html += `<div class=\"sentence-item\">`;
                    html += `<div class=\"sentence-text\">${sentence}</div>`;
                    html += `<div class=\"sentence-translation\">Translation: Error occurred</div>`;
                    html += `</div>`;
                }
            }
            
            sentenceArea.innerHTML = html;
            
            // Update pagination controls
            updatePaginationControls(page, sentences.length);
        } catch (error) {
            console.error('Error translating sentences:', error);
            sentenceArea.innerHTML = '<p>Error loading sentence translations. Please try again later.</p>';
        }
    }
    
    // Update pagination controls
    function updatePaginationControls(page, totalSentences) {
        const totalPages = Math.ceil(totalSentences / sentencesPerPage);
        
        pageInfo.textContent = `Page ${page} of ${totalPages}`;
        
        prevPageBtn.disabled = page === 1;
        nextPageBtn.disabled = page === totalPages;
        
        paginationControls.style.display = 'flex';
        
        // Add event listeners for pagination buttons
        prevPageBtn.onclick = function() {
            if (currentPage > 1) {
                currentPage--;
                displaySentencesForPage(currentPage);
            }
        };
        
        nextPageBtn.onclick = function() {
            if (currentPage < totalPages) {
                currentPage++;
                displaySentencesForPage(currentPage);
            }
        };
    }
    
    // Show word definition
    async function showDefinition(word) {
        // Show loading message
        definitionArea.innerHTML = '<div class="loading">Loading comprehensive definition...</div>';
        
        try {
            // Fetch data from Dictionary API
            const dictionaryResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            let dictionaryData = null;
            
            if (dictionaryResponse.ok) {
                dictionaryData = await dictionaryResponse.json();
            }
            
            // Fetch Hindi translation from MyMemory API
            const translationResponse = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|hi`
            );
            const translationData = await translationResponse.json();
            
            // Display the combined information
            displayEnhancedDefinition(word, dictionaryData, translationData);
        } catch (error) {
            console.error('Error fetching data:', error);
            definitionArea.innerHTML = `
                <h3>${word}</h3>
                <p>Error loading definition. Please try again later.</p>
            `;
        }
    }
    
    // Display enhanced definition
    function displayEnhancedDefinition(word, dictionaryData, translationData) {
        // If no data from dictionary API, show basic info
        if (!dictionaryData || dictionaryData.length === 0) {
            let html = `<h3>${word}</h3>`;
            
            // Add Hindi translation if available
            if (translationData && translationData.responseData && translationData.responseData.translatedText) {
                html += `<div class=\"translation\">Hindi Translation: ${translationData.responseData.translatedText}</div>`;
            }
            
            html += `<p>No detailed definition found.</p>`;
            definitionArea.innerHTML = html;
            return;
        }
        
        // Get the first entry (most common definition)
        const entry = dictionaryData[0];
        let html = `<h3>${entry.word}</h3>`;
        
        // Add phonetic information
        if (entry.phonetic) {
            html += `<div class=\"phonetic\">Phonetic: ${entry.phonetic}</div>`;
        }
        
        // Add phonetics with audio icon if available
        if (entry.phonetics && entry.phonetics.length > 0) {
            html += `<div class=\"phonetics-container\">`;
            entry.phonetics.forEach((phonetic, index) => {
                if (phonetic.text) {
                    let audioHtml = `<div class=\"phonetic\">Pronunciation: ${phonetic.text}`;
                    if (phonetic.audio) {
                        audioHtml += ` <span class=\"audio-icon\" data-audio=\"${phonetic.audio}\"></span>`;
                    }
                    audioHtml += `</div>`;
                    html += audioHtml;
                }
            });
            html += `</div>`;
        }
        
        // Add Hindi translation
        if (translationData && translationData.responseData && translationData.responseData.translatedText) {
            html += `<div class=\"translation\">Hindi Translation: ${translationData.responseData.translatedText}</div>`;
        }
        
        // Add meanings
        if (entry.meanings && entry.meanings.length > 0) {
            html += `<div class=\"meanings-container\">`;
            
            entry.meanings.forEach((meaning, index) => {
                html += `<div class=\"meaning-item\">`;
                
                // Part of speech
                if (meaning.partOfSpeech) {
                    html += `<div class=\"part-of-speech\">${meaning.partOfSpeech}</div>`;
                }
                
                // Definitions
                if (meaning.definitions && meaning.definitions.length > 0) {
                    html += `<div class=\"definitions-list\">`;
                    
                    meaning.definitions.forEach((def, defIndex) => {
                        html += `<div class=\"definition-item\">`;
                        html += `<p><strong>Definition:</strong> ${def.definition}</p>`;
                        
                        // Example
                        if (def.example) {
                            html += `<p class=\"example\"><strong>Example:</strong> ${def.example}</p>`;
                        }
                        
                        // Synonyms
                        if (def.synonyms && def.synonyms.length > 0) {
                            html += `<div class=\"synonyms\"><strong>Synonyms:</strong> ${def.synonyms.join(', ')}</div>`;
                        }
                        
                        // Antonyms
                        if (def.antonyms && def.antonyms.length > 0) {
                            html += `<div class=\"antonyms\"><strong>Antonyms:</strong> ${def.antonyms.join(', ')}</div>`;
                        }
                        
                        html += `</div>`; // Close definition-item
                    });
                    
                    html += `</div>`; // Close definitions-list
                }
                
                // Top-level synonyms and antonyms for this part of speech
                if (meaning.synonyms && meaning.synonyms.length > 0) {
                    html += `<div class=\"synonyms\"><strong>Synonyms:</strong> ${meaning.synonyms.join(', ')}</div>`;
                }
                
                if (meaning.antonyms && meaning.antonyms.length > 0) {
                    html += `<div class=\"antonyms\"><strong>Antonyms:</strong> ${meaning.antonyms.join(', ')}</div>`;
                }
                
                html += `</div>`; // Close meaning-item
            });
            
            html += `</div>`; // Close meanings-container
        }
        
        // Add source information
        if (entry.sourceUrls && entry.sourceUrls.length > 0) {
            html += `<div class=\"source-info\">Source: <a href=\"${entry.sourceUrls[0]}\" target=\"_blank\">${entry.sourceUrls[0]}</a></div>`;
        }
        
        // Add license information
        if (entry.license) {
            html += `
                <div class=\"license-info\">
                    License: <a href=\"${entry.license.url}\" target=\"_blank\">${entry.license.name}</a>
                </div>
            `;
        }
        
        definitionArea.innerHTML = html;
        
        // Add event listeners to audio icons
        document.querySelectorAll('.audio-icon').forEach(icon => {
            icon.addEventListener('click', function() {
                const audioUrl = this.getAttribute('data-audio');
                if (audioUrl) {
                    // Create audio element
                    const audio = new Audio(audioUrl);
                    // Play the audio
                    audio.play().catch(e => console.error('Error playing audio:', e));
                }
            });
        });
    }
    
    // Display word frequency analysis
    function displayFrequencyAnalysis() {
        if (!nlp) {
            frequencyArea.innerHTML = '<p>NLP model not loaded. Please try again.</p>';
            return;
        }
        
        frequencyArea.innerHTML = '<div class="loading">Analyzing word frequency...</div>';
        
        try {
            const doc = nlp.readDoc(cleanText);
            
            // Get all tokens and filter for words
            const tokens = doc.tokens().out();
            const words = tokens.filter(token => {
                // Filter for alphabetic tokens that are not stop words
                return /^[a-zA-Z]+$/.test(token) && token.length > 3;
            });
            
            // Count word frequencies
            const frequencyMap = {};
            words.forEach(word => {
                const lowerWord = word.toLowerCase();
                frequencyMap[lowerWord] = (frequencyMap[lowerWord] || 0) + 1;
            });
            
            // Sort by frequency
            const sortedWords = Object.entries(frequencyMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20); // Top 20 words
            
            // Generate HTML
            let html = '<h3>Word Frequency Analysis</h3>';
            html += `<p>Analysis of ${words.length} words in the text</p>`;
            
            if (sortedWords.length > 0) {
                html += '<div class="frequency-chart">';
                html += '<h4>Top 20 Most Frequent Words</h4>';
                
                // Find max frequency for scaling
                const maxFreq = sortedWords[0][1];
                
                sortedWords.forEach(([word, freq]) => {
                    const percentage = (freq / maxFreq) * 100;
                    html += `
                        <div class=\"frequency-item\">
                            <div>
                                <strong>${word}</strong> (${freq} occurrences)
                            </div>
                            <div class=\"frequency-bar\">
                                <div class=\"frequency-bar-fill\" style=\"width: ${percentage}%\"></div>
                            </div>
                        </div>
                    `;
                });
                
                html += '</div>';
            } else {
                html += '<p>No frequent words found.</p>';
            }
            
            frequencyArea.innerHTML = html;
        } catch (error) {
            console.error('Error in frequency analysis:', error);
            frequencyArea.innerHTML = '<p>Error analyzing word frequency. Please try again.</p>';
        }
    }
    
    // Display language complexity analysis
    function displayComplexityAnalysis() {
        if (!nlp) {
            complexityArea.innerHTML = '<p>NLP model not loaded. Please try again.</p>';
            return;
        }
        
        complexityArea.innerHTML = '<div class="loading">Analyzing language complexity...</div>';
        
        try {
            const doc = nlp.readDoc(cleanText);
            
            // Get sentences
            const sentences = doc.sentences().out();
            
            // Get words
            const tokens = doc.tokens().out();
            const words = tokens.filter(token => /^[a-zA-Z]+$/.test(token));
            
            // Calculate metrics
            const avgSentenceLength = words.length / sentences.length;
            const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
            
            // Count complex words (longer than 6 characters)
            const complexWords = words.filter(word => word.length > 6);
            const complexWordRatio = complexWords.length / words.length;
            
            // Generate HTML
            let html = '<h3>Language Complexity Analysis</h3>';
            
            html += `
                <div class=\"complexity-metric\">
                    <h4>Text Statistics</h4>
                    <p>Total Sentences: ${sentences.length}</p>
                    <p>Total Words: ${words.length}</p>
                    <p>Average Sentence Length: ${avgSentenceLength.toFixed(1)} words</p>
                    <p>Average Word Length: ${avgWordLength.toFixed(1)} characters</p>
                </div>
            `;
            
            html += `
                <div class=\"complexity-metric\">
                    <h4>Complexity Score</h4>
                    <div class=\"complexity-value\">${(complexWordRatio * 100).toFixed(1)}%</div>
                    <p>Percentage of complex words (longer than 6 characters)</p>
                </div>
            `;
            
            // Simple difficulty classification
            let difficulty = 'Beginner';
            if (complexWordRatio > 0.3) {
                difficulty = 'Advanced';
            } else if (complexWordRatio > 0.15) {
                difficulty = 'Intermediate';
            }
            
            html += `
                <div class=\"complexity-metric\">
                    <h4>Estimated Difficulty Level</h4>
                    <div class=\"complexity-value\">${difficulty}</div>
                </div>
            `;
            
            complexityArea.innerHTML = html;
        } catch (error) {
            console.error('Error in complexity analysis:', error);
            complexityArea.innerHTML = '<p>Error analyzing language complexity. Please try again.</p>';
        }
    }
    
    // Display collocation analysis
    function displayCollocationAnalysis() {
        if (!nlp) {
            collocationArea.innerHTML = '<p>NLP model not loaded. Please try again.</p>';
            return;
        }
        
        collocationArea.innerHTML = '<div class="loading">Analyzing collocations...</div>';
        
        try {
            const doc = nlp.readDoc(cleanText);
            
            // Get sentences for context
            const sentences = doc.sentences().out();
            
            // Find common phrases (noun phrases, verb phrases)
            const nounPhrases = doc.nouns().out();
            const verbs = doc.verbs().out();
            
            // Generate HTML
            let html = '<h3>Collocation Analysis</h3>';
            
            if (nounPhrases.length > 0) {
                html += '<h4>Common Noun Phrases</h4>';
                
                // Count noun phrase frequencies
                const npMap = {};
                nounPhrases.forEach(phrase => {
                    const lowerPhrase = phrase.toLowerCase();
                    npMap[lowerPhrase] = (npMap[lowerPhrase] || 0) + 1;
                });
                
                // Sort by frequency and show top 10
                const sortedNP = Object.entries(npMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);
                
                sortedNP.forEach(([phrase, freq]) => {
                    // Find a sentence containing this phrase
                    const contextSentence = sentences.find(sentence => 
                        sentence.toLowerCase().includes(phrase)
                    ) || 'Context not available';
                    
                    html += `
                        <div class=\"collocation-item\">
                            <div class=\"collocation-phrase\">${phrase}</div>
                            <div>Frequency: ${freq} times</div>
                            <div class=\"collocation-context\">${contextSentence}</div>
                        </div>
                    `;
                });
            } else {
                html += '<p>No significant noun phrases found.</p>';
            }
            
            if (verbs.length > 0) {
                html += '<h4 style=\"margin-top: 20px;\">Common Verbs</h4>';
                
                // Count verb frequencies
                const verbMap = {};
                verbs.forEach(verb => {
                    const lowerVerb = verb.toLowerCase();
                    verbMap[lowerVerb] = (verbMap[lowerVerb] || 0) + 1;
                });
                
                // Sort by frequency and show top 10
                const sortedVerbs = Object.entries(verbMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);
                
                sortedVerbs.forEach(([verb, freq]) => {
                    // Find a sentence containing this verb
                    const contextSentence = sentences.find(sentence => 
                        sentence.toLowerCase().includes(verb)
                    ) || 'Context not available';
                    
                    html += `
                        <div class=\"collocation-item\">
                            <div class=\"collocation-phrase\">${verb}</div>
                            <div>Frequency: ${freq} times</div>
                            <div class=\"collocation-context\">${contextSentence}</div>
                        </div>
                    `;
                });
            }
            
            collocationArea.innerHTML = html;
        } catch (error) {
            console.error('Error in collocation analysis:', error);
            collocationArea.innerHTML = '<p>Error analyzing collocations. Please try again.</p>';
        }
    }
    
    // Process file button
    processBtn.addEventListener('click', function() {
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select an SRT file first.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            srtContent = e.target.result;
            vocabWords = extractVocabulary(srtContent);
            sentences = extractSentences(srtContent);
            cleanText = extractCleanText(srtContent); // For NLP analysis
            displayWords(vocabWords);
            
            // Show message in other areas
            sentenceArea.innerHTML = '<p>Click on the "Sentence Translations" tab to view translations.</p>';
            frequencyArea.innerHTML = '<p>Click on the "Word Frequency" tab to view analysis.</p>';
            complexityArea.innerHTML = '<p>Click on the "Language Complexity" tab to view analysis.</p>';
            collocationArea.innerHTML = '<p>Click on the "Collocations" tab to view analysis.</p>';
        };
        reader.readAsText(file);
    });
});
