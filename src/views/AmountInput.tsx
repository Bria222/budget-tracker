import * as React from "react";
import Grid from "@material-ui/core/Grid";
import { CurrencyInput } from "./CurrencyInput";
import { TextInput } from "./TextInput";
import { currenciesStore } from "../stores/CurrenciesStore";
import { round } from "../utils";

interface AmountInputProps {
    label?: string;
    amountInput?: number;
    onAmountChange: (amount: number) => void;
    helperText?: string;
}

export const AmountInput: React.FC<AmountInputProps> = (props) => {

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const amountFloat = parseFloat(event.target.value);
        props.onAmountChange(amountFloat);
    }

    return (
        <TextInput 
            autoFocus
            required
            type='number'
            label={props.label || 'Amount'}
            value={props.amountInput || ''}
            inputProps={{ step: '.01', 'aria-required': true }}
            onChange={handleAmountChange}
            helperText={props.helperText}
        />
    );           
}

interface AmountCurrencyInputProps  {
    baseCurrency?: string;
    amountInBaseCurrency?: number;
    onChange: (amount: number, currency: string, amountBase?: number) => void;
    selectedCurrency: string;
    amountInput?: number;
    label?: string;
}

export const AmountWithCurrencyInput: React.FC<AmountCurrencyInputProps> = (props) => {

    const [amountInBaseCurrency, setAmountInBaseCurrency] = React.useState<number|undefined>(props.amountInBaseCurrency);
    
    // calculate amount in base currency
    React.useEffect(() => {
        let isSubscribed = true;
        const calculateAmountInBaseCurrency = async (
            amount: number, 
            baseCurrency: string, 
            currency: string) => {
            const calculatedAmount = await currenciesStore.getAmountInBaseCurrency(
                baseCurrency, 
                currency,
                amount);
            setAmountInBaseCurrency(round(calculatedAmount));
            props.onChange(amount, currency, calculatedAmount);
        }
        if (isSubscribed &&
            props.baseCurrency &&
            props.selectedCurrency && 
            props.amountInput && 
            props.baseCurrency !== props.selectedCurrency) {
            calculateAmountInBaseCurrency(props.amountInput, props.baseCurrency, props.selectedCurrency);
        } else {
            setAmountInBaseCurrency(props.amountInput);
            props.onChange(props.amountInput || 0, props.selectedCurrency, props.amountInput);
        }
        return () => {isSubscribed = false};
    }, 
    // eslint-disable-next-line
    [
        props.baseCurrency, props.amountInput, props.selectedCurrency
    ]);

    const handleAmountChange = (amount: number) => {
        props.onChange(amount, props.selectedCurrency, amountInBaseCurrency);
    }

    const handleCurrencyChange = (selectedCurrency: string) => {
        props.onChange(props.amountInput || 0, selectedCurrency, amountInBaseCurrency);
    }

    const baseAmount = () => {
        if (props.baseCurrency !== props.selectedCurrency && amountInBaseCurrency) {
            return `${round(amountInBaseCurrency)} ${props.baseCurrency}`;
        }
        return undefined;
    }

    return (
        <Grid container direction='row' alignItems='baseline'>
            <Grid item>
                <AmountInput 
                    amountInput={props.amountInput}
                    label={props.label}
                    onAmountChange={handleAmountChange} helperText={baseAmount()}/>
            </Grid>
            <Grid item >
                <CurrencyInput 
                    selectedCurrency={props.selectedCurrency}
                    onCurrencyChange={handleCurrencyChange}/>
            </Grid>
        </Grid>);
}

export default AmountWithCurrencyInput;
