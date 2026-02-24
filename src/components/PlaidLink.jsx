import React, { useCallback, useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { supabase } from '../supabaseClient';

const PlaidLink = () => {
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    const getLinkToken = async () => {
      console.log("Attempting to wake up Plaid Handler..."); // Vibe check
      const { data, error } = await supabase.functions.invoke('plaid-handler', {
        body: { action: 'create_link_token' }
      });

      if (error) console.error("Plaid Function Error:", error.message);
      if (data?.link_token) {
        console.log("Link Token Received!");
        setLinkToken(data.link_token);
      }
    };
    getLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token) => console.log("Success!", public_token),
  });

  return (
    <div className="neu-flat p-6 mt-6 border-2 border-dashed border-indigo-500/20">
      <h3 className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-indigo-500 mb-4">
        Bank Connectivity
      </h3>
      {/* If linkToken is null, we'll show a status message instead of nothing */}
      {!linkToken ? (
        <p className="text-[9px] font-bold text-orange-500 animate-pulse uppercase">
          ⚠️ Waiting for Plaid Link Token...
        </p>
      ) : (
        <button
          onClick={() => open()}
          className="neu-button w-full p-4 rounded-2xl text-[10px] font-black uppercase text-indigo-500"
        >
          🔗 Link Sandbox Bank
        </button>
      )}
    </div>
  );
};

export default PlaidLink;