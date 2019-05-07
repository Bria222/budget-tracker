import * as React from 'react';
import { categoriesStore } from '../../stores/CategoriesStore';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';

import Grid, { GridDirection } from '@material-ui/core/Grid';
import { RouterProps } from 'react-router';
import { SaveButton, CancelButton, DeleteButton } from '../buttons';

interface CategoryFormProps extends RouterProps{
    name?: string;
    direction ?: GridDirection;
    hideCancel?: boolean;
    closeAfterSave?: boolean;
    onChange?: () => void;
}

export class CategoryForm extends React.PureComponent<CategoryFormProps, {name: string}> {

    private readonly store = categoriesStore;

    constructor(props: CategoryFormProps){
        super(props);
        this.state = {name: props.name || ''};
    }

    private handleSave = () => {
        this.store.add(this.state.name);
        if (this.props.onChange) {
            this.props.onChange();
        }
        if (this.props.closeAfterSave) {
            this.close();
        }
    }

    private handleDelete = () => {
        this.store.delete(this.state.name);
        if (this.props.onChange) {
            this.props.onChange();
        }
        if (this.props.closeAfterSave) {
            this.close();
        }
    }
    
    private close = () => {
        if (this.props.history.length > 2) {
            this.props.history.goBack();
        } else {
            this.props.history.replace('/');
        }
    }
    
    render () {
        return (
            <Grid container direction={this.direction}>
                <Grid item>
                    <this.TextInput 
                        label={ this.direction === 'row' ? '' : 'Category Name' }
                        value={ this.state.name }
                        onChange={this.handleChange('name')}
                        style={{ margin: 8 }}
                        margin='dense' />
                    </Grid>
                <Grid item>
                    <Grid container direction='row' justify='space-around'>
                        <SaveButton onClick={this.handleSave} disabled={this.state.name === ''} />
                    { this.props.name && 
                        <DeleteButton disabled={this.state.name === ''} onClick={this.handleDelete}/> }
                    { !this.props.hideCancel &&
                        <CancelButton  onClick={this.close} />}
                    </Grid>
                </Grid>
            </Grid> 
        );
    }

    get direction () {
        return this.props.direction || 'column';
    }

    handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ name: event.target.value });
    }

    private TextInput = (props: TextFieldProps) => (
        <TextField
            {...props}
            id={`input-field-${props.label}`}
            label={props.label}
            value={props.value}
            onChange={this.handleChange(props.label.toString().toLowerCase())}
            style={{ margin: 8 }}
            margin='dense'
        />);
            
}