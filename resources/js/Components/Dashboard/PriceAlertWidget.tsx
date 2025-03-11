interface Currency {
    code: string;
    name: string;
    flag: string;
    selected: boolean;
  }

  interface Props {
    currencies: Currency[];
  }

  export default function PriceAlertWidget({ currencies }: Props) {
    // If needed, track local state, e.g. for “Show More”
    const shortList = currencies.slice(0, 5);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <div className="text-lg font-semibold mb-4 dark:text-gray-100">New price alert</div>

        {shortList.map((currency) => (
          <div
            key={currency.code}
            className="flex items-center justify-between mb-3 py-2 dark:text-gray-100"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{currency.flag}</span>
              <span>
                {currency.name} ({currency.code})
              </span>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-blue-600"
              checked={currency.selected}
              onChange={() => {}}
            />
          </div>
        ))}

        {currencies.length > 5 && (
          <button className="bg-blue-50 dark:bg-blue-600 text-blue-600 dark:text-gray-100 w-full py-3 rounded-lg mt-4 font-medium">
            Show more
          </button>
        )}

        <button className="bg-blue-50 dark:bg-blue-600 text-blue-600 dark:text-gray-100 w-full py-3 rounded-lg mt-4 font-medium">
          Set notification
        </button>
      </div>
    );
  }
