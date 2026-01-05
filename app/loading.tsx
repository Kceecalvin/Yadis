import LoadingScreen from './components/LoadingScreen';

export default function Loading() {
  return (
    <LoadingScreen
      title="YADDPLAST"
      message="Loading your store..."
      steps={['Fetching products', 'Loading categories', 'Preparing recommendations']}
    />
  );
}
