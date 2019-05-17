import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import { iconsStore, IconName } from '../../stores/IconsStore';
import { CategoryIconButton } from './CategoryIconButton';

interface IconsDialogSelectorProps {
    selectedValue: IconName;
    open: boolean;
    onClose: (selectedValue: IconName) => void;
};

export class IconsDialogSelector extends React.PureComponent<IconsDialogSelectorProps> {
    private readonly titleId = 'dialog-title';

    render (){
        return (
            <Dialog 
                onClose={this.handleClose} 
                aria-labelledby={this.titleId} open={this.props.open}>
                <DialogTitle id={this.titleId}>Select icon for category</DialogTitle>
                <DialogContent>
                    <Grid container direction='row' justify='center'>
                        { iconsStore.getCategoryIcons().map( icon => 
                            <CategoryIconButton 
                                onClick={this.handleItemClick} 
                                icon={icon} 
                                key={`dialog-icon-${icon}`} />)} 
                    </Grid>
                </DialogContent>
            </Dialog>
        );
    }

    handleClose = () => {
        this.props.onClose(this.props.selectedValue);
    };

    handleItemClick = (value: IconName) => {
        this.props.onClose(value);
    };
}

