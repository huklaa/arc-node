// Copyright 2026 Circle Internet Group, Inc. All rights reserved.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { expect } from 'chai'
import { schemaProtocolConfig } from '../../scripts/genesis/ProtocolConfig'

const maxUint64 = 18446744073709551615n

const configWithBlockGasLimit = (blockGasLimit: bigint) => ({
  proxy: { admin: '0x0000000000000000000000000000000000000001' },
  owner: '0x0000000000000000000000000000000000000002',
  controller: '0x0000000000000000000000000000000000000003',
  pauser: '0x0000000000000000000000000000000000000004',
  feeParams: {
    alpha: 0n,
    kRate: 0n,
    inverseElasticityMultiplier: 0n,
    minBaseFee: 0n,
    maxBaseFee: 0n,
    blockGasLimit,
  },
})

describe('schemaProtocolConfig', () => {
  it('accepts the minimum positive block gas limit', () => {
    expect(schemaProtocolConfig.safeParse(configWithBlockGasLimit(1n)).success).to.equal(true)
  })

  it('rejects a zero block gas limit', () => {
    expect(schemaProtocolConfig.safeParse(configWithBlockGasLimit(0n)).success).to.equal(false)
  })

  it('rejects block gas limits above uint64', () => {
    expect(schemaProtocolConfig.safeParse(configWithBlockGasLimit(maxUint64 + 1n)).success).to.equal(false)
  })
})
