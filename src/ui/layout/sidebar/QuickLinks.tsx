// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DocumentTextIcon } from '@heroicons/react/outline';
import { Link } from 'react-router-dom';
import { NavLink } from './NavLink';
import { useDatabase } from 'ui/contexts';
import { useDbQuery } from 'ui/hooks';
// import { Dropdown } from 'ui/components';
// import { useNavigate } from 'react-router';
// import {
//   components,
//   ControlProps,
// } from 'react-select';
// import type { DropdownOption } from 'types';

export function QuickLinks() {
  // const navigate = useNavigate();
  const { db } = useDatabase();
  const [contracts] = useDbQuery(() => db?.contracts.toArray() || Promise.resolve(null), [db]);
  // const contracts = [
  //   {name: '12313', address: '1242423424334234234234'},
  //   {name: 'wrewrqw', address: '2242423424334234234234'},
  //   {name: '4353er', address: '3242423424334234234234'},
  //   {name: '12313', address: '4242423424334234234234'},
  //   {name: 'wrewrqw', address: '5242423424334234234234'},
  //   {name: '4353er', address: '6242423424334234234234'},
  //   {name: '12313', address: '7242423424334234234234'},
  //   {name: 'wrewrqw', address: '8242423424334234234234'},
  //   {name: '4353er', address: '9242423424334234234234'}
  // ]

  // const dropdownOptions = (contracts || []).map(network => ({
  //   // label: network.name,
  //   label: (
  //     <>
  //       <DocumentTextIcon aria-hidden="true" className="h-5 w-5 text-gray-500 inline" />
  //       <span>{network.name}</span>
  //     </>
  //   ),
  //   value: network.address,
  // }));


// function Control<T>(props: ControlProps<DropdownOption<T>, false>) {
//   return  <components.Control {...props} className="min-h-0">
//             <DocumentTextIcon
//               aria-hidden="true"
//               className="h-5 w-5 text-gray-500"
//             />{props.children}
//           </components.Control>
// }
// const Option = (props: any) => (
//   <div {...props} className="min-h-0 p-1">
//     <DocumentTextIcon aria-hidden="true" className="h-5 w-5 text-gray-500 inline" />{props.data.label}
//   </div>
// );

  return (
    <div className="quick-links">
      <div className="section your-contracts">
        <div className="header text-gray-400 mr-2">Your Contracts</div>
        {contracts && contracts.length > 0 ? (
          <div className='quick-links-tags'>
            {
              contracts.map(({ name, address }) => {
                return (
                  <NavLink icon={DocumentTextIcon} key={address} to={`/contract/${address}`}>
                    {name}
                  </NavLink>
                );
              })
            }
          </div>
          // <Dropdown
          //   menuPosition="fixed"
          //   className='min-w-40'
          //   onChange={e => {
          //     navigate(`/contract/${e}`);
          //   }}
          //   placeholder=""
          //   options={dropdownOptions}
          //   value={''}
          // />
        ) : (
          <div className="none-yet text-gray-400">
            None yet&nbsp;
            {' • '}&nbsp;
            <Link className="text-blue-400" to={`/instantiate`}>
              Upload one
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
