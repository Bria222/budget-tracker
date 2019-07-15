import * as React from "react";
import { RouteComponentProps } from "react-router";
import Grid from "@material-ui/core/Grid";
import Link from '@material-ui/core/Link';
import { MyLink } from "../../components/MyLink";
import { BudgetUrl, getDateString, uuid, round } from "../../utils";
import { TextInput } from "../../components/TextInput";
import { countriesStore } from "../../stores/CountriesStore";
import { HeaderNotifierProps } from "../../routes";
import { SaveButtonFab, DeleteButton } from "../../components/buttons";
import CountryInput from "../../components/CountryInput";
import AmountWithCurrencyInput from "../../components/AmountWithCurrencyInput";
import { Category, Categories, CurrencyRates, Expense } from "../../interfaces";
import { CategoryFormDialog } from "../../components/CategoryFormDialog";
import { btApp } from "../../BudgetTracker";
import { DAY_MS } from "../../BudgetModel";

interface ExpenseViewProps extends HeaderNotifierProps,
    RouteComponentProps<{ budgetId: string; expenseId: string }> { }

export const ExpenseView: React.FC<ExpenseViewProps> = (props) => {

    const [error, setError] = React.useState<string|undefined>();
    const [categories, setCategories] = React.useState<Categories>({});

    const [addCategoryOpen, setAddCategoryOpen] = React.useState(false);

    const [currency, setCurrency] = React.useState<string>();
    const [amount, setAmount] = React.useState<number>();
    const [countryCode, setCountryCode] = React.useState<string>('ES');
    const [dateString, setDateString] = React.useState(getDateString());
    const [identifier, setIdentifier] = React.useState(uuid());
    const [categoryId, setCategoryId] = React.useState();
    const [amountBaseCurrency, setAmountBaseCurrency] = React.useState<number>();
    const [baseCurrency, setBaseCurrency] = React.useState<string>();
    const [description, setDescription] = React.useState<string>();

    const [rates, setRates] = React.useState<CurrencyRates>();

    const [splitInDays, setSplitInDays] = React.useState<number|undefined>();

    const {budgetId, expenseId} = props.match.params;
    const {onActions, onTitleChange, history} = props;
    const {replace} = history;
    const budgetUrl = new BudgetUrl(budgetId);
    const isAddView = expenseId === undefined;

    React.useEffect(() => {
        async function initRates (baseCurrency: string) {
            setRates(await btApp.currenciesStore.getRates(baseCurrency));
        }
        async function initBudget () {
            const b = await btApp.budgetsStore.getBudgetInfo(budgetId);
            setBaseCurrency(b.currency);
            initRates(b.currency);
            if (isAddView) {
                setCurrency(b.currency);
            }
        }
        async function initCategories () {
            const categories = await btApp.categoriesStore.getCategories();
            setCategories(categories);
            if (!categoryId) {
                setCategoryId(categories[0]);
            }
        }
        async function handleDelete () {
            await btApp.budgetsStore.deleteExpense(budgetId, expenseId);
            replace(budgetUrl.path);
        }

        async function initAdd () {
            onTitleChange(`Add expense`);
            const setCurrentCountry = async (currentCountry: string) => {
                setCountryCode(currentCountry);
                setCurrency(await btApp.currenciesStore.getFromCountry(currentCountry));
            }
            const currentCountry = countriesStore.currentCountryCode;
            setCurrentCountry(currentCountry);

            const currentCountryFetched = await countriesStore.getCurrentCountry();
            if (currentCountry !== currentCountryFetched) {
                setCurrentCountry(currentCountryFetched);
            }
        }

        async function initEdit () {
            onTitleChange(`Edit expense`);
            const model = await btApp.budgetsStore.getBudgetModel(budgetId);
            const e = model.getExpense(expenseId);
            setAmount(e.amount);
            e.amountBaseCurrency && setAmountBaseCurrency(e.amountBaseCurrency);
            setCategoryId(e.categoryId);
            setCountryCode(e.countryCode);
            setCurrency(e.currency);
            setDescription(e.description);
            setDateString(getDateString(new Date(e.when)));
            setIdentifier(e.identifier);
        }
        
        onActions(<DeleteButton onClick={handleDelete}/>);
        initBudget();
        initCategories();
        if (isAddView) {
            initAdd();
        } else {
            initEdit();
        }
        return function () {
            onActions([]);
        }

        // eslint-disable-next-line
    }, [budgetId, expenseId]);

    function createExpense (dayNumber: number, inputAmount: number, inputAmountBase: number, timeMs: number): Expense {
        if (currency) {
            return {   
                amount: inputAmount, 
                categoryId,
                currency,
                countryCode,
                identifier: identifier + dayNumber,
                when: timeMs + (DAY_MS * dayNumber),
                amountBaseCurrency: inputAmountBase,
                description
            };
        }
        throw new Error(`Invalid expense data: Currency is missing`);
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const max = splitInDays || 1;
        if (amount && amountBaseCurrency) {
            const inputAmount = amount / max;
            const inputAmountBase = amountBaseCurrency / max;
            const timeMs = new Date(dateString).getTime();
            for (let i=0; i < max; i++) {
                await btApp.budgetsStore.setExpense(
                        budgetId, 
                        createExpense(i, inputAmount, inputAmountBase, timeMs))
            }    
            props.history.replace(budgetUrl.path);
        } else {
            throw new Error('Invalid expense data: Missing amount');
        }
    }

    const CategoryOptions = React.useMemo(
        () => (Object.entries(categories).map(
            ([k, v]) => (
                <option key={`category-option-${k}`} value={v.id}>{v.name}</option>))), 
        [categories]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setCategoryId(e.target.value);
    }

    const handleAddCategoryClick = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setAddCategoryOpen(true);
    }

    const handleAddCategoryClose = (category?: Category) => {
        if (category) {
            btApp.categoriesStore.setCategory(category);
            setCategories({...categories, category});
            setCategoryId(category.id);
        }
        setAddCategoryOpen(false);
    }
    
    const CategoryInput = () => (
        <TextInput
            label='Category'
            onChange={handleCategoryChange}
            value={categoryId}
            helperText={
                <Link component={MyLink} onClick={handleAddCategoryClick}>Add category</Link>}
            select
            required 
            SelectProps={{ native: true }} >
            { CategoryOptions }
        </TextInput>
    );

    const handleWhen = (e: React.ChangeEvent<HTMLInputElement>) => (
        setDateString(e.target.value)
    );

    const WhenInput = () => (
        <TextInput
            required
            label='When'
            type='date'
            value={ dateString }
            InputLabelProps={ {shrink: true,} }
            onChange={ handleWhen }
        />
    );

    const handleDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setDescription(e.target.value);
    }

    const handleCountry = (countryCode: string) => (
        setCountryCode(countryCode)
    );

    const handleAmountChange = (amount: number, currency: string, amountBaseCurrency?:number) => {
        setCurrency(currency);
        setAmount(amount);
        setAmountBaseCurrency(amountBaseCurrency);
    }

    const handleSplitInDays = (e: React.ChangeEvent<HTMLInputElement>) => {
        const days = parseInt(e.target.value);
        setSplitInDays(days || undefined);
    }

    function amountPerDay () {
        if (amountBaseCurrency && baseCurrency && splitInDays && splitInDays > 1) {
            return `${round(amountBaseCurrency / splitInDays) } ${baseCurrency} per day`;
        }
        return undefined;
    }

    return (
        <React.Fragment>
            <CategoryFormDialog 
            open={addCategoryOpen} 
            onClose={handleAddCategoryClose} />
            <form onSubmit={handleSubmit} autoComplete='on'>
                <Grid container
                    justify='space-between'
                    alignItems='baseline'
                    alignContent='stretch'>
                    <Grid item >
                        { rates && currency && <AmountWithCurrencyInput
                            rates={ rates }
                            amountInput={amount}
                            amountInBaseCurrency={amountBaseCurrency}
                            selectedCurrency={currency}
                            onChange={handleAmountChange}
                            onError={setError}
                        /> }
                    </Grid>
                    <Grid item >
                        <CategoryInput />
                    </Grid>
                    <Grid item>
                        <WhenInput />
                    </Grid>
                    <Grid item>
                        <CountryInput 
                            selectedCountry={ countryCode } 
                            onCountryChange={ handleCountry }/>
                    </Grid>
                    <Grid item >
                        <TextInput 
                            label='Description' 
                            value={ description || '' }
                            onChange={ handleDescription } />
                    </Grid>
                    <Grid item>
                        <TextInput 
                            type='number'
                            label={'Split in days'}
                            value={ splitInDays }
                            helperText={ amountPerDay() }
                            onChange={ handleSplitInDays }
                            inputProps={ { min: 1 } }
                        />
                    </Grid>
                </Grid>
                <SaveButtonFab type='submit' color='primary' disabled={error !== undefined}/>
            </form>
        </React.Fragment>
        );
}

export default ExpenseView;
