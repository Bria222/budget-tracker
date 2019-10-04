import * as React from 'react';
import { RouterProps } from 'react-router';
import { Category, Categories } from '../../api';
import CategoryInput from '../../components/categories/CategoryInput';
import { SaveButtonFab } from '../../components/buttons/SaveButton';
import { AddButton } from '../../components/buttons/AddButton';
import { CategoryPaths } from '../../domain/paths/CategoryPaths';
import { useAppContext } from '../../contexts/AppContext';
import { HeaderNotifierProps } from '../../routes';
import { useCategoriesStore } from '../../hooks/useCategoriesStore';

interface CategoriesMapProps {
    onDelete: (id: string) => void;
    onChange: (category: Category) => void;
    categories: Categories;
}

const CategoriesMap: React.FC<CategoriesMapProps> = (props) => {
    const CategoriesMemo = React.useMemo(() => (
        <React.Fragment>
            {Object.values(props.categories).map(c => 
                <CategoryInput 
                    category={c}
                    direction='row' 
                    key={`category-entry-${c.identifier}`}
                    onChange={ props.onChange }
                    onDelete={ props.onDelete }/>)
            }
        </React.Fragment>
    // eslint-disable-next-line
    ), [props.categories]);

    return CategoriesMemo;
}

export const CategoryList: React.FC<RouterProps&HeaderNotifierProps> = (props) => {
    const btApp = useAppContext();

    const [categories, setCategories] = React.useState<Categories>({});
    const [viewCategories, setViewCategories] = React.useState<Categories>({});
    const [deleteCategories, setDeleteCategories] = React.useState<Set<string>>(new Set<string>());
    const [updatedCategories, setUpdatedCategories] = React.useState<Set<string>>(new Set<string>());
    const store = useCategoriesStore();

    React.useEffect(() => {
        async function init() {
            if (store) {
                setCategories(await store.getCategories());
            }
        }
        init();
    }, [store]);

    React.useEffect(() => {
        setViewCategories({...categories});
    }, [categories]);

    React.useLayoutEffect(() => {
        props.onTitleChange('Categories');
        return function () {
            props.onTitleChange('');
        };
    // eslint-disable-next-line
    }, []);

    const [changed, setChanged] = React.useState(false);

    const handleChange = (category: Category) => {
        viewCategories[category.identifier] = category;
        setViewCategories(viewCategories);
        if (updatedCategories.add(category.identifier)) {
            setUpdatedCategories(updatedCategories);
        }
        setChanged(true);
    }

    const handleDelete = (id: string) => {
        delete viewCategories[id];
        setCategories(viewCategories);
        if (deleteCategories.add(id)) {
            setDeleteCategories(deleteCategories);
        }
        setChanged(true);
    }

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const store = await btApp.getCategoriesStore();
        const categories: Category[] = [];
        updatedCategories.forEach(id => categories.push(viewCategories[id]));
        const promises: Promise<void|boolean>[] = [store.setCategories(categories)];
        deleteCategories.forEach(id => promises.push(store.deleteCategory(id)));
        await Promise.all(promises);
        setChanged(false);
    }

    return (
        <form onSubmit={handleSave}>
            <CategoriesMap 
                onChange={handleChange}
                onDelete={handleDelete}
                categories={viewCategories}/>
            <AddButton to={CategoryPaths.Add}/>
            <SaveButtonFab type='submit' disabled={!changed} color={'secondary'}/>
        </form>
    );

}

export default CategoryList;