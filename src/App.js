import { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import './App.css';
import ListItem from './components/ListItem';

function App() {
	const [fiatCurrency, setFiatCurrency] = useState('EUR');
	const [currencyList, setCurrencyList] = useState([]);
	const searchInputRef = useRef(null);

	const [searchCryptoError, setSearchCryptoError] = useState(false);
	const [holdings, setHoldings] = useLocalStorage(
		'crypto_tracker_holdings',
		{}
	);

	useEffect(() => {
		fetch(
			'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' +
				Object.keys(holdings).join(',') +
				'&tsyms=' +
				fiatCurrency +
				'&api_key=' +
				process.env.REACT_APP_CRYPTO_API_KEY
		).then(async (response) => {
			let resJSON = await response.json();
			setCurrencyList(resJSON);
		});
	}, [holdings, fiatCurrency]);

	const updateAmount = (name, amount) => {
		const tmpHoldings = holdings;
		if (!tmpHoldings[name]) {
			tmpHoldings[name] = {};
		}
		tmpHoldings[name].amount = parseFloat(amount);
		setHoldings(tmpHoldings);
	};

	const calculateSum = () => {
		let sum = 0;
		let keys = Object.keys(currencyList);

		if (keys.length !== Object.keys(holdings).length) {
			return 0;
		}
		for (let i = 0; i < keys.length; i++) {
			sum +=
				holdings[keys[i]].amount * currencyList[keys[i]][fiatCurrency];
		}
		return Math.floor(sum * 100) / 100;
	};

	const searchCrypto = () => {
		const value = searchInputRef.current.value;
		fetch(
			`https://min-api.cryptocompare.com/data/price?fsym=${value.toUpperCase()}&tsyms=${fiatCurrency}&api_key=${
				process.env.REACT_APP_CRYPTO_API_KEY
			}`
		).then(async (response) => {
			const resJSON = await response.json();
			if (resJSON.Response) {
				setSearchCryptoError(true);
			} else {
				setSearchCryptoError(false);
				searchInputRef.current.value = '';
				updateAmount(value.toUpperCase(), 0);
			}
		});
	};

	return (
		<div className='App'>
			<h1>Crypto Tracker</h1>

			<div className='Conatiner'>
				<div className='ListConfig'>
					<div className='Search'>
						<input
							ref={searchInputRef}
							type='text'
							placeholder='Cryptowährung mit offiziellem Kürzel suchen (z.B. BTC oder ETH)'
						/>
						<button onClick={searchCrypto}>Suchen</button>
					</div>
					{searchCryptoError && (
						<p className='Error'>
							Die Cryprowährung konnte nicht gefunden werden
						</p>
					)}
					{Object.keys(holdings).length > 0 && (
						<div className='SelectFiat'>
							<select
								value={fiatCurrency}
								onChange={(e) =>
									setFiatCurrency(e.target.value)
								}>
								<option value='EUR'>EUR</option>
								<option value='CHF'>CHF</option>
								<option value='USD'>USD</option>
							</select>
						</div>
					)}
				</div>
				{Object.keys(holdings).length > 0 &&
					Object.keys(currencyList).length > 0 && (
						<div className='List'>
							<div className='ListHeader'>
								<div className='Name'>Name</div>
								<div className='Value'>
									Wert in {fiatCurrency}
								</div>
								<div className='Amount'>Menge</div>
								<div className='Product'>
									Gesamt ({fiatCurrency})
								</div>
							</div>

							{Object.keys(holdings).map((currency) => (
								<ListItem
									key={currency}
									fiatCurrency={fiatCurrency}
									updateAmount={updateAmount}
									holdings={holdings[currency]}
									data={currencyList[currency]}
									name={currency}></ListItem>
							))}

							<div className='Sums'>
								<div className='Name'></div>
								<div className='Value'></div>
								<div className='Amount'>Gesamt:</div>
								<div className='Product'>{calculateSum()}</div>
							</div>
						</div>
					)}
			</div>
			<div className='Footer'>
				<h3>Datenschutz Hinweis</h3>
				<p>
					Die Daten, die Sie auf dieser Seite eingeben, werden nur
					lokal in Ihrem Browser gespeichert und nicht
					weiterverwendet. Um sie zu löschen, gehen Sie in Ihre
					Browsereinstellungen.
				</p>
			</div>
		</div>
	);
}

export default App;
