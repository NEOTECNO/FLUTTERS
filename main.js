console.log("main.js script is running.");

try {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log("DOM is fully loaded and parsed.");
        
        const SEI_RPC_ENDPOINT = 'https://evm-rpc.sei-apis.com';
        const SEI_CONTRACT_ADDRESS = '0x03Fcb74b320A2A6B9Ef8595246681D42c0C80788';
        const SEI_CHAIN_ID = 'pacific-1';
        
        let walletAddress = null;
        let connectedWalletName = null;
        let ownedNFTs = [];

        const walletGrid = document.getElementById('wallet-grid');
        const connectButton = document.getElementById('open-connect-modal');
        const ownedNFTsDisplay = document.getElementById('owned_nfts');
        const walletAddressDisplay = document.getElementById('wallet_address');
        const total_supply = document.getElementById('total_supply');
        const messageBox = document.getElementById('message_box');
        const messageBoxOverlay = document.getElementById('message_box_overlay');
        const messageTitle = document.getElementById('message_title');
        const messageContent = document.getElementById('message_content');
        const closeMessageButton = document.getElementById('close_message');
        const walletModal = document.getElementById('wallet-modal');
        const closeModalButton = document.getElementById('close-modal');

        // Modal and Message Box functions
        function showMessageBox(title, content) {
            messageTitle.textContent = title;
            messageContent.textContent = content;
            messageBox.style.display = 'block';
            messageBoxOverlay.style.display = 'block';
        }

        function hideMessageBox() {
            messageBox.style.display = 'none';
            messageBoxOverlay.style.display = 'none';
        }

        function showModal() {
            if (walletModal) {
                walletModal.classList.remove('hidden');
                walletModal.classList.add('flex');
            }
            console.log("Showing wallet modal.");
        }

        function hideModal() {
            if (walletModal) {
                walletModal.classList.add('hidden');
                walletModal.classList.remove('flex');
            }
        }

        if (closeMessageButton) closeMessageButton.addEventListener('click', hideMessageBox);
        if (messageBoxOverlay) messageBoxOverlay.addEventListener('click', hideMessageBox);
        if (closeModalButton) closeModalButton.addEventListener('click', hideModal);

        function renderNFTs() {
            if (!walletGrid) {
                console.error("Wallet grid element not found.");
                return;
            }

            walletGrid.innerHTML = '';
            
            if (walletAddress && ownedNFTs.length > 0) {
                ownedNFTs.forEach((nft) => {
                    const card = document.createElement('div');
                    card.classList.add('flex', 'flex-col', 'w-full', 'max-w-xs', 'h-[30rem]', 'rounded-3xl', 'shadow-lg', 'border', 'border-gray-700', 'overflow-hidden', 'transition-transform', 'transform', 'hover:scale-105', 'cursor-pointer');
                    
                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add('w-full', 'aspect-square', 'overflow-hidden');
                    
                    const img = document.createElement('img');
                    img.classList.add('w-full', 'h-full', 'object-cover');
                    img.src = nft.imageUrl;
                    img.alt = `NFT #${nft.id}`;

                    const textContainer = document.createElement('div');
                    textContainer.classList.add('flex-grow', 'p-6', 'bg-gray-950/75', 'backdrop-blur-sm', 'flex', 'flex-col', 'justify-end', 'text-center', 'space-y-2');

                    const name = document.createElement('h3');
                    name.classList.add('text-xl', 'text-white', 'font-bold');
                    name.textContent = nft.metadata.name;
                    
                    const ammoAttribute = nft.metadata.attributes.find(attr => attr.trait_type === 'Game-Ammo');
                    const livesAttribute = nft.metadata.attributes.find(attr => attr.trait_type === 'Game-Lives');

                    const statsContainer = document.createElement('div');
                    statsContainer.classList.add('flex', 'justify-around', 'text-gray-400', 'text-sm');

                    const ammo = document.createElement('span');
                    ammo.textContent = `Ammo: ${ammoAttribute ? ammoAttribute.value : 'N/A'}`;

                    const lives = document.createElement('span');
                    lives.textContent = `Lives: ${livesAttribute ? livesAttribute.value : 'N/A'}`;

                    statsContainer.appendChild(ammo);
                    statsContainer.appendChild(lives);
                    
                    textContainer.appendChild(name);
                    textContainer.appendChild(statsContainer);
                    
                    imgContainer.appendChild(img);
                    card.appendChild(imgContainer);
                    card.appendChild(textContainer);
                    walletGrid.appendChild(card);
                });
            } else if (walletAddress) {
                walletGrid.innerHTML = '<p class="text-center text-gray-500 col-span-full">No NFTs found in your wallet.</p>';
            } else {
                const placeholders = new Array(4).fill(0);
                placeholders.forEach((_, index) => {
                    const card = document.createElement('div');
                    card.classList.add('flex', 'flex-col', 'w-full', 'max-w-xs', 'h-[30rem]', 'rounded-3xl', 'shadow-lg', 'border', 'border-gray-700', 'overflow-hidden', 'transition-transform', 'transform', 'hover:scale-105', 'cursor-not-allowed');
                    
                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add('w-full', 'aspect-square', 'overflow-hidden');
                    
                    const img = document.createElement('img');
                    img.classList.add('w-full', 'h-full', 'object-cover', 'blur-sm');
                    img.src = './images/example-placeholder.png';
                    img.alt = `NFT Placeholder #${index + 1}`;

                    const textContainer = document.createElement('div');
                    textContainer.classList.add('flex-grow', 'p-6', 'bg-gray-950/75', 'backdrop-blur-sm', 'flex', 'flex-col', 'justify-end', 'text-center');

                    const text = document.createElement('span');
                    text.classList.add('text-lg', 'text-gray-400', 'font-medium');
                    text.textContent = `Connect to View NFT #${index + 1}`;
                    
                    imgContainer.appendChild(img);
                    textContainer.appendChild(text);
                    card.appendChild(imgContainer);
                    card.appendChild(textContainer);
                    walletGrid.appendChild(card);
                });
            }
        }

        function updateStats() {
            if (ownedNFTsDisplay) {
                ownedNFTsDisplay.textContent = ownedNFTs.length;
            } else {
                console.error("Owned NFTs display element not found.");
            }
        }

        function updateUI() {
            if (!connectButton || !walletAddressDisplay) {
                console.error("Connect button or wallet address display element not found.");
                return;
            }

            if (walletAddress) {
                const truncatedAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
                connectButton.textContent = truncatedAddress;
                connectButton.classList.remove('animate-pulse');
                walletAddressDisplay.classList.add('hidden');
            } else {
                connectButton.textContent = 'Connect Wallet';
                connectButton.classList.add('animate-pulse');
                walletAddressDisplay.classList.add('hidden');
            }
            updateStats();
            renderNFTs();
        }

        async function fetchOwnedNFTs(address) {
            console.log("Fetching NFTs for address:", address);
            try {
                showMessageBox('Fetching NFTs', 'Checking contract for tokens...');
        
                const callData = '0x8462151c000000000000000000000000' + address.substring(2);
                
                const response = await fetch(SEI_RPC_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "jsonrpc": "2.0",
                        "id": 1,
                        "method": "eth_call",
                        "params": [{ "to": SEI_CONTRACT_ADDRESS, "data": callData }, "latest"]
                    })
                });
                const result = await response.json();
                
                if (result.error) throw new Error(result.error.message);
                
                const hexData = result.result;
                const tokenIds = [];

                const arrayLength = parseInt(hexData.substring(66, 130), 16);
                
                // Parse the array of token IDs
                for (let i = 0; i < arrayLength; i++) {
                    const startIndex = 130 + (i * 64);
                    const tokenIdHex = hexData.substring(startIndex, startIndex + 64);
                    tokenIds.push(parseInt(tokenIdHex, 16));
                }
                console.log("Found token IDs:", tokenIds);

                showMessageBox('Fetching NFTs', 'Found tokens, now fetching metadata...');

                const nftDataPromises = tokenIds.map(async id => {
                    try {
                        const tokenIdHex = '0x' + id.toString(16).padStart(64, '0');
                        const tokenUriCallData = '0xc87b56dd' + tokenIdHex.substring(2);

                        const tokenUriResponse = await fetch(SEI_RPC_ENDPOINT, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                "jsonrpc": "2.0",
                                "id": 1,
                                "method": "eth_call",
                                "params": [{ "to": SEI_CONTRACT_ADDRESS, "data": tokenUriCallData }, "latest"]
                            })
                        });

                        const tokenUriResult = await tokenUriResponse.json();
                        if (tokenUriResult.error) {
                            throw new Error(`TokenURI call failed: ${tokenUriResult.error.message}`);
                        }

                        const uriHex = tokenUriResult.result.substring(130);
                        let uri = '';
                        
                        for (let i = 0; i < uriHex.length; i += 2) {
                            uri += String.fromCharCode(parseInt(uriHex.substring(i, i + 2), 16));
                        }
                        
                        const metadataUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
                        console.log('Fetching metadata from:', metadataUrl);

                        const res = await fetch(metadataUrl);
                        
                        if (!res.ok) {
                            throw new Error(`Failed to fetch metadata for token ${id}. Status: ${res.status} ${res.statusText}`);
                        }
                        const metadata = await res.json();
                        
                        const imageUrl = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                        return { id, imageUrl, metadata };
                    } catch (error) {
                        console.error(`Error processing metadata for token ${id}:`, error);
                        
                        return { id, imageUrl: 'https://placehold.co/500x500/000000/FFFFFF?text=Error', metadata: null };
                    }
                });

                ownedNFTs = await Promise.all(nftDataPromises);
                
                ownedNFTs = ownedNFTs.filter(nft => nft.imageUrl !== 'https://placehold.co/500x500/000000/FFFFFF?text=Error');

                console.log("Successfully fetched all NFTs:", ownedNFTs);
                hideMessageBox();
            } catch (error) {
                console.error("Error fetching NFTs:", error);
                showMessageBox('API Error', `Failed to fetch NFTs. Error: ${error.message}. This is likely a problem with the RPC endpoint or the contract's implementation.`);
                ownedNFTs = [];
            }
            updateUI();
        }

        async function fetchTotalSupply() {
            try {
                const totalSupplyCallData = '0x18160ddd';

                const response = await fetch(SEI_RPC_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "jsonrpc": "2.0",
                        "id": 1,
                        "method": "eth_call",
                        "params": [{ "to": SEI_CONTRACT_ADDRESS, "data": totalSupplyCallData }, "latest"]
                    })
                });
                const result = await response.json();

                if (result.error) {
                    throw new Error(`Total supply call failed: ${result.error.message}`);
                }

                const hexValue = result.result;
                const totalSupplyValue = parseInt(hexValue, 16);

                if (total_supply) {
                    total_supply.textContent = totalSupplyValue;
                }
            } catch (error) {
                console.error("Error fetching total supply:", error);
                if (total_supply) {
                    total_supply.textContent = 'N/A';
                }
            }
        }
        
        async function connectWallet(walletName) {
            hideModal();
            showMessageBox('Connecting...', `Please approve the connection in your ${walletName} wallet. If you do not see a pop-up, please check your browser's extension settings.`);
            try {
                let accounts = [];
                let cosmosAccount = null;

                if (walletName === 'Compass') {
                    if (typeof window.compass === 'undefined') {
                        throw new Error('Compass wallet is not installed. Please install it to continue.');
                    }
                    await window.compass.enable(SEI_CHAIN_ID);
                    const compassOfflineSigner = window.compass.getOfflineSigner(SEI_CHAIN_ID);
                    accounts = await compassOfflineSigner.getAccounts();
                    if (accounts && accounts.length > 0) {
                        cosmosAccount = accounts[0];
                    }
                } else if (walletName === 'Keplr') {
                    if (typeof window.keplr === 'undefined') {
                        throw new Error('Keplr wallet is not installed. Please install it to continue.');
                    }
                    await window.keplr.enable(SEI_CHAIN_ID);
                    const keplrOfflineSigner = window.getOfflineSigner(SEI_CHAIN_ID);
                    accounts = await keplrOfflineSigner.getAccounts();
                    if (accounts && accounts.length > 0) {
                        cosmosAccount = accounts[0];
                    }
                }

                if (cosmosAccount) {
                    // Use ethers.js to compute the EVM address from the public key
                    const pubkeyHex = ethers.utils.hexlify(cosmosAccount.pubkey);
                    const evmAddress = ethers.utils.computeAddress(pubkeyHex);
                    
                    walletAddress = evmAddress;
                    connectedWalletName = walletName;
                    console.log(`Successfully derived EVM address from public key: ${walletAddress}`);
                    await fetchOwnedNFTs(walletAddress);
                } else {
                    throw new Error('No accounts were returned by the wallet. Please try again.');
                }
            } catch (error) {
                console.error("Wallet connection error:", error);
                showMessageBox('Connection Failed', `Could not connect to ${walletName} wallet. Error: ${error.message}. Please ensure the extension is enabled and you have approved the connection.`);
            }
        }

        // Add event listeners for wallet selection buttons
        const compassButton = document.getElementById('connect-compass');
        if (compassButton) {
            compassButton.addEventListener('click', () => connectWallet('Compass'));
        }

        const keplrButton = document.getElementById('connect-keplr');
        if (keplrButton) {
            keplrButton.addEventListener('click', () => connectWallet('Keplr'));
        }

        // Add event listener to the main connect button
        if (connectButton) {
            connectButton.addEventListener('click', showModal);
        }
        
        await fetchTotalSupply();
        updateUI();
    });
} catch (error) {
    console.error("An error occurred in the main script:", error);
}
