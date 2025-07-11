import React from 'react';
import { IonSearchbar } from '@ionic/react';

interface ModelSearchProps {
  onSearch: (query: string) => void;
}

const ModelSearch: React.FC<ModelSearchProps> = ({ onSearch }) => {
  const [query, setQuery] = React.useState('');

  const handleInput = (e: CustomEvent) => {
    const value = e.detail.value || '';
    setQuery(value);
    onSearch(value);
  };

  return (
    <IonSearchbar
      style={{ width: '75%', marginTop: '30px', display: 'block' }}
      value={query}
      onIonInput={handleInput}
      placeholder="Search..."
      debounce={300}
    />
  );
};

export default ModelSearch;