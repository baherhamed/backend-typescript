// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hashString = async (text: string) => {
  let success = false;

  const replacementList = [
    {
      key: 'a',
      with: 1,
    },
    {
      key: 'A',
      with: 'a',
    },
    {
      key: 'b',
      with: 2,
    },
    {
      key: 'B',
      with: 'b',
    },
    {
      key: 'c',
      with: 3,
    },
    {
      key: 'C',
      with: 'c',
    },
    {
      key: 'd',
      with: 4,
    },
    {
      key: 'D',
      with: 'd',
    },
    {
      key: 'e',
      with: 5,
    },
    {
      key: 'E',
      with: 'e',
    },
    {
      key: 'f',
      with: 6,
    },
    { key: 'F', with: 'f' },
    {
      key: 'g',
      with: 7,
    },
    {
      key: 'G',
      with: 'g',
    },
    {
      key: 'h',
      with: 8,
    },
    { key: 'H', with: 'h' },
    { key: 'i', with: 9 },
    { key: 'I', with: 'i' },
    { key: 'j', with: 10 },
    { key: 'J', with: 'j' },
    { key: 'k', with: 11 },
    { key: 'K', with: 'k' },
    { key: 'l', with: 12 },
    { key: 'L', with: 'l' },
    { key: 'm', with: 13 },
    { key: 'M', with: 'm' },
    { key: 'n', with: 14 },
    { key: 'N', with: 'n' },
    { key: 'o', with: 15 },
    { key: 'O', with: 'o' },
    { key: 'p', with: 16 },
    { key: 'P', with: 'p' },
    { key: 'q', with: 17 },
    { key: 'Q', with: 'q' },
    { key: 'r', with: 18 },
    { key: 'R', with: 'r' },
    { key: 's', with: 19 },
    { key: 'S', with: 's' },
    { key: 't', with: 20 },
    { key: 'T', with: 't' },
    { key: 'u', with: 21 },
    { key: 'U', with: 'u' },
    { key: 'v', with: 22 },
    { key: 'V', with: 'v' },
    { key: 'w', with: 23 },
    { key: 'W', with: 'w' },
    { key: 'x', with: 24 },
    { key: 'X', with: 'x' },
    { key: 'y', with: 25 },
    { key: 'Y', with: 'y' },
    { key: 'z', with: 26 },
    { key: 'Z', with: 'z' },
    { key: ',', with: '%' },
    { key: '[', with: '#' },
    { key: ']', with: '#' },
  ];

  const newText = text.split('');

  const hashedText = [];
  for await (let elm of newText) {
    const selectedIndex = replacementList.find((el) => el.key == elm);

    if (selectedIndex) {
      elm = selectedIndex.with.toString();
      hashedText.push(elm);
    }
  }

  console.log('hashedText', hashedText);

  success = true;
  return {
    success,
    hashedText,
  };
};
