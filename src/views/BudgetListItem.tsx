import * as React from "react";
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid";
import { Budget } from "../interfaces";
import { dateDiff } from "../utils";
import { MyLink } from "./MyLink";


export class BudgetListItem extends React.PureComponent<Budget> {
    render(){
        return <ListItem 
            button 
            component={MyLink}
            href={`/budgets/${this.props.identifier}`}>
            <ListItemText 
                primary={this.props.name} 
                secondary={
                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="center"
                        component="span"
                    >
                        <Typography component="span" color="textPrimary">
                            {`${this.days} days`}
                        </Typography>
                        <Typography component="span" color="textSecondary" align="right">
                            {`${this.props.total} ${this.props.currency}`}
                        </Typography>
                    </Grid>
                }
            />
        </ListItem>;
    }

    get days () {
        return dateDiff(this.props.to, this.props.from);
    }
}