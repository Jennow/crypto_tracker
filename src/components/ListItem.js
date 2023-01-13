import React, { useState } from 'react';

const ListItem = ({ data, holdings, name, fiatCurrency, updateAmount }) => {
	const [amount, setAmount] = useState(holdings.amount);

	if (!data) return;

	return (
		<div className='ListItem'>
			<div className='Name'>{name}</div>
			<div className='Value'>{data[fiatCurrency]}</div>
			<div className='Amount'>
				<input
					onChange={(e) => {
						setAmount(e.target.value);
					}}
					onBlur={(e) => {
						updateAmount(name, amount);
					}}
					type='number'
					value={amount}
					min='0'
				/>
			</div>
			<div className='Product'>
				{data[fiatCurrency] &&
					Math.floor(data[fiatCurrency] * amount * 100) / 100}
			</div>
		</div>
	);
};

export default ListItem;
